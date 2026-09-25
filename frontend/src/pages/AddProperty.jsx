import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
import { createProperty, uploadPropertyImages } from "../services/propertyService";

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

function AddProperty() {

    const navigate = useNavigate();

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
    const [imageFiles, setImageFiles] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(previous => ({ ...previous, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        if (imageFiles.length + files.length > 10) {
            setError("You can upload a maximum of 10 images.");
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

        setImageFiles((prev) => [...prev, ...validFiles]);
        setImagePreviews((prev) => [...prev, ...validPreviews]);
        setError("");
    };

    const handleRemoveImage = (index) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
        setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!position) {
            setError("Please choose the property location on the map.");
            return;
        }

        setLoading(true);

        try {
            let uploadedUrls = [];
            if (imageFiles.length > 0) {
                const uploadRes = await uploadPropertyImages(imageFiles);
                uploadedUrls = uploadRes.data.urls || [];
            }

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
                images: uploadedUrls
            };

            await createProperty(propertyData);

            alert("Property added successfully!");
            navigate("/properties");

        } catch (err) {
            console.error(err);

            if (err.response) {
                setError(err.response.data.message);
            } else {
                setError("Could not connect to the server.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-property-page">

            <div className="add-property-header">
                <span>DARI</span>
                <h1>Add your property</h1>
                <p>Tell people about the property you want to sell or rent.</p>
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
                        Add up to 10 photos of your property (JPEG, PNG, WebP — max 5MB each).
                    </p>

                    <div style={{ marginTop: "14px" }}>
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
                            <FaCamera /> Select Photos
                            <input
                                type="file"
                                multiple
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                            />
                        </label>
                        <span style={{ marginLeft: "12px", color: "#6B7C8E", fontSize: "13px" }}>
                            {imageFiles.length} {imageFiles.length === 1 ? "photo" : "photos"} selected
                        </span>
                    </div>

                    {imagePreviews.length > 0 && (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                            gap: "12px",
                            marginTop: "16px"
                        }}>
                            {imagePreviews.map((previewUrl, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        position: "relative",
                                        borderRadius: "6px",
                                        overflow: "hidden",
                                        height: "100px",
                                        border: "1px solid #EDE7DA"
                                    }}
                                >
                                    <img
                                        src={previewUrl}
                                        alt={`Preview ${idx + 1}`}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveImage(idx)}
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
                                        title="Remove photo"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="form-section">
                    <h2>Property location</h2>
                    <p className="section-description">
                        Click on the map to place your property's exact location.
                    </p>

                    <div className="location-map">
                        <MapContainer
                            center={[34.7406, 10.7603]}
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

                <button className="submit-property-button" type="submit" disabled={loading}>
                    {loading ? "Publishing..." : "Publish property"}
                </button>

            </form>

        </div>
    );
}

export default AddProperty;