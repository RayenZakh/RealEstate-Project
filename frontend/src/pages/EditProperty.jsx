import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    MapContainer,
    TileLayer,
    Marker,
    useMapEvents
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/AddProperty.css";
import L from "leaflet";
import { FaTimes, FaCamera } from "react-icons/fa";
import { getPropertyById, updateProperty, uploadPropertyImages } from "../services/propertyService";
import { useAuth } from "../hooks/useAuth";
import { getImageUrl } from "../utils/imageHelper";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

function LocationPicker({ position, setPosition }) {
    useMapEvents({
        click(event) {
            setPosition([event.latlng.lat, event.latlng.lng]);
        }
    });

    return position ? <Marker position={position} /> : null;
}

function EditProperty() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        listingType: "sale",
        propertyType: "apartment",
        bedrooms: "",
        bathrooms: "",
        area: "",
        city: ""
    });

    const [position, setPosition] = useState(null);
    const [existingImages, setExistingImages] = useState([]);
    const [newFiles, setNewFiles] = useState([]);
    const [newPreviews, setNewPreviews] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [unauthorized, setUnauthorized] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const loadProperty = async () => {
            try {
                const response = await getPropertyById(id);
                const property = response.data;
                if (!isMounted) return;

                // Ownership check on the client
                const ownerId = typeof property.owner === "object" ? property.owner?._id : property.owner;
                if (user && ownerId && ownerId !== user.id) {
                    setUnauthorized(true);
                    setFetching(false);
                    return;
                }

                setFormData({
                    title: property.title || "",
                    description: property.description || "",
                    price: property.price || "",
                    listingType: property.listingType || "sale",
                    propertyType: property.propertyType || "apartment",
                    bedrooms: property.bedrooms ?? 0,
                    bathrooms: property.bathrooms ?? 0,
                    area: property.area || "",
                    city: property.location?.city || ""
                });

                setExistingImages(Array.isArray(property.images) ? property.images : []);

                if (property.location?.latitude && property.location?.longitude) {
                    setPosition([property.location.latitude, property.location.longitude]);
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Load property error:", err);
                setError("Could not load property details.");
            } finally {
                if (isMounted) setFetching(false);
            }
        };

        loadProperty();

        return () => {
            isMounted = false;
        };
    }, [id, user]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRemoveExistingImage = (index) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleNewImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const totalCount = existingImages.length + newFiles.length + files.length;
        if (totalCount > 10) {
            setError("You can have a maximum of 10 images in total.");
            return;
        }

        const validFiles = [];
        const validPreviews = [];
        for (const file of files) {
            if (!file.type.startsWith("image/")) {
                setError(`File "${file.name}" is not an image.`);
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError(`Image "${file.name}" exceeds the 5MB size limit.`);
                return;
            }
            validFiles.push(file);
            validPreviews.push(URL.createObjectURL(file));
        }

        setNewFiles((prev) => [...prev, ...validFiles]);
        setNewPreviews((prev) => [...prev, ...validPreviews]);
        setError("");
    };

    const handleRemoveNewImage = (index) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
        setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!position) {
            setError("Please select the property location on the map.");
            return;
        }

        setLoading(true);

        try {
            let uploadedUrls = [];
            if (newFiles.length > 0) {
                const uploadRes = await uploadPropertyImages(newFiles);
                uploadedUrls = uploadRes.data.urls || [];
            }

            const finalImages = [...existingImages, ...uploadedUrls];

            const propertyData = {
                title: formData.title,
                description: formData.description,
                price: Number(formData.price),
                listingType: formData.listingType,
                propertyType: formData.propertyType,
                bedrooms: Number(formData.bedrooms) || 0,
                bathrooms: Number(formData.bathrooms) || 0,
                area: Number(formData.area),
                location: {
                    city: formData.city,
                    latitude: position[0],
                    longitude: position[1]
                },
                images: finalImages
            };

            await updateProperty(id, propertyData);
            alert("Property updated successfully!");
            navigate("/profile");

        } catch (err) {
            console.error("Update property error:", err);
            setError(err.response?.data?.message || "Could not update property.");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div style={{ maxWidth: "800px", margin: "60px auto", textAlign: "center", color: "#6B7C8E" }}>
                Loading property details...
            </div>
        );
    }

    if (unauthorized) {
        return (
            <div style={{ maxWidth: "600px", margin: "60px auto", textAlign: "center", padding: "40px 20px" }}>
                <h2 style={{ color: "#C53030", marginBottom: "12px" }}>Unauthorized</h2>
                <p style={{ color: "#5A6872", marginBottom: "24px" }}>
                    You are not the owner of this property and cannot edit it.
                </p>
                <Link to="/properties" style={{ color: "#1B2733", fontWeight: "600" }}>
                    &larr; Return to Properties
                </Link>
            </div>
        );
    }

    return (
        <div className="add-property-page">
            <div className="add-property-header">
                <span>DARI</span>
                <h1>Edit your property</h1>
                <p>Update the information or location for this listing.</p>
            </div>

            <form className="property-form" onSubmit={handleSubmit}>
                <section className="form-section">
                    <h2>Basic information</h2>

                    <div className="form-grid">
                        <div className="input-group full">
                            <label>Property title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Example: Modern apartment in Sfax"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Listing type</label>
                            <select name="listingType" value={formData.listingType} onChange={handleChange}>
                                <option value="sale">For Sale</option>
                                <option value="rent">For Rent</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Property type</label>
                            <select name="propertyType" value={formData.propertyType} onChange={handleChange}>
                                <option value="apartment">Apartment</option>
                                <option value="house">House</option>
                                <option value="villa">Villa</option>
                                <option value="land">Land</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Price (TND)</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                min="0"
                                placeholder="180000"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Area (m²)</label>
                            <input
                                type="number"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                min="1"
                                placeholder="120"
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Bedrooms</label>
                            <input
                                type="number"
                                name="bedrooms"
                                value={formData.bedrooms}
                                onChange={handleChange}
                                min="0"
                                placeholder="3"
                            />
                        </div>

                        <div className="input-group">
                            <label>Bathrooms</label>
                            <input
                                type="number"
                                name="bathrooms"
                                value={formData.bathrooms}
                                onChange={handleChange}
                                min="0"
                                placeholder="2"
                            />
                        </div>

                        <div className="input-group full">
                            <label>City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="Sfax"
                                required
                            />
                        </div>

                        <div className="input-group full">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="5"
                                placeholder="Describe the property..."
                                required
                            />
                        </div>
                    </div>
                </section>

                <section className="form-section">
                    <h2>Property photos</h2>
                    <p className="section-description">
                        Manage your property photos. Add new photos or remove existing ones (maximum 10 photos total).
                    </p>

                    {/* Existing photos */}
                    {existingImages.length > 0 && (
                        <div style={{ marginTop: "16px" }}>
                            <strong style={{ fontSize: "14px", color: "#1B2733", display: "block", marginBottom: "8px" }}>
                                Current photos ({existingImages.length})
                            </strong>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                                gap: "12px"
                            }}>
                                {existingImages.map((imgUrl, idx) => (
                                    <div
                                        key={`existing-${idx}`}
                                        style={{
                                            position: "relative",
                                            borderRadius: "6px",
                                            overflow: "hidden",
                                            height: "100px",
                                            border: "1px solid #EDE7DA"
                                        }}
                                    >
                                        <img
                                            src={getImageUrl(imgUrl)}
                                            alt={`Property ${idx + 1}`}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(idx)}
                                            style={{
                                                position: "absolute",
                                                top: "4px",
                                                right: "4px",
                                                background: "rgba(197, 48, 48, 0.85)",
                                                color: "#FFFFFF",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: "22px",
                                                height: "22px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                fontSize: "11px"
                                            }}
                                            title="Delete photo"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add new photos button */}
                    <div style={{ marginTop: "18px" }}>
                        <label
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                                background: "#1B2733",
                                color: "#FFFFFF",
                                padding: "10px 18px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}
                        >
                            <FaCamera /> Add New Photos
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                onChange={handleNewImageChange}
                                style={{ display: "none" }}
                            />
                        </label>
                        <span style={{ marginLeft: "12px", color: "#6B7C8E", fontSize: "13px" }}>
                            {newFiles.length} new {newFiles.length === 1 ? "photo" : "photos"} selected
                        </span>
                    </div>

                    {/* New photo previews */}
                    {newPreviews.length > 0 && (
                        <div style={{ marginTop: "16px" }}>
                            <strong style={{ fontSize: "14px", color: "#1B2733", display: "block", marginBottom: "8px" }}>
                                New photo previews (to be saved)
                            </strong>
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                                gap: "12px"
                            }}>
                                {newPreviews.map((previewUrl, idx) => (
                                    <div
                                        key={`new-${idx}`}
                                        style={{
                                            position: "relative",
                                            borderRadius: "6px",
                                            overflow: "hidden",
                                            height: "100px",
                                            border: "2px dashed #D9A24C"
                                        }}
                                    >
                                        <img
                                            src={previewUrl}
                                            alt={`New preview ${idx + 1}`}
                                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewImage(idx)}
                                            style={{
                                                position: "absolute",
                                                top: "4px",
                                                right: "4px",
                                                background: "rgba(0, 0, 0, 0.65)",
                                                color: "#FFFFFF",
                                                border: "none",
                                                borderRadius: "50%",
                                                width: "22px",
                                                height: "22px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                fontSize: "11px"
                                            }}
                                            title="Cancel photo"
                                        >
                                            <FaTimes />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section className="form-section">
                    <h2>Property location</h2>
                    <p className="section-description">
                        Click on the map to update the property's exact location.
                    </p>

                    <div className="location-map">
                        <MapContainer
                            center={position || [34.7406, 10.7603]}
                            zoom={12}
                            scrollWheelZoom={true}
                            className="add-map"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LocationPicker position={position} setPosition={setPosition} />
                        </MapContainer>
                    </div>

                    {position && (
                        <div className="coordinates">
                            <strong>Selected location</strong>
                            <span>Latitude: {position[0].toFixed(6)}</span>
                            <span>Longitude: {position[1].toFixed(6)}</span>
                        </div>
                    )}
                </section>

                {error && <div className="form-error">{error}</div>}

                <div style={{ display: "flex", gap: "16px", marginTop: "24px" }}>
                    <button className="submit-property-button" type="submit" disabled={loading}>
                        {loading ? "Saving changes..." : "Save changes"}
                    </button>
                    <Link
                        to="/profile"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "14px 24px",
                            borderRadius: "6px",
                            border: "1px solid #D0D7DE",
                            background: "#FFFFFF",
                            color: "#1B2733",
                            textDecoration: "none",
                            fontWeight: "500",
                            fontSize: "15px"
                        }}
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default EditProperty;
