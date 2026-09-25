import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
    FaMapMarkerAlt,
    FaBed,
    FaBath,
    FaRulerCombined,
    FaPhone,
    FaEnvelope,
    FaUser,
    FaChevronLeft,
    FaChevronRight,
    FaArrowLeft,
    FaEdit,
    FaTrash
} from "react-icons/fa";

import { getPropertyById, deleteProperty as deletePropertyRequest } from "../services/propertyService";
import { useAuth } from "../hooks/useAuth";
import { getImageUrl, DEFAULT_PLACEHOLDER_IMAGE } from "../utils/imageHelper";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

function PropertyDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const currentUserId = user?.id;

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const fetchDetails = async () => {
            try {
                const response = await getPropertyById(id);
                if (!isMounted) return;
                setProperty(response.data);
            } catch (err) {
                if (!isMounted) return;
                console.error("Error loading property details:", err);
                setError(err.response?.data?.message || "Property not found.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchDetails();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this property?")) return;
        try {
            await deletePropertyRequest(id);
            alert("Property deleted successfully.");
            navigate("/properties");
        } catch (err) {
            console.error("Delete property error:", err);
            alert(err.response?.data?.message || "Could not delete property.");
        }
    };

    if (loading) {
        return (
            <div style={{ maxWidth: "1160px", margin: "80px auto", textAlign: "center", color: "#6B7C8E" }}>
                Loading property details...
            </div>
        );
    }

    if (error || !property) {
        return (
            <div style={{ maxWidth: "600px", margin: "80px auto", textAlign: "center", padding: "0 20px" }}>
                <h2 style={{ color: "#1B2733", marginBottom: "12px" }}>Property Not Found</h2>
                <p style={{ color: "#6B7C8E", marginBottom: "24px" }}>
                    {error || "The property listing you requested could not be located."}
                </p>
                <Link
                    to="/properties"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#1B2733",
                        color: "#FFFFFF",
                        padding: "10px 20px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontWeight: "500"
                    }}
                >
                    <FaArrowLeft /> Back to Properties
                </Link>
            </div>
        );
    }

    const images = Array.isArray(property.images) && property.images.length > 0 ? property.images : [];
    const isOwner = currentUserId && property.owner && currentUserId === (typeof property.owner === "object" ? property.owner._id : property.owner);

    const prevImage = () => {
        setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const nextImage = () => {
        setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    return (
        <div style={{ maxWidth: "1160px", margin: "32px auto 60px", padding: "0 24px" }}>
            {/* Top Navigation Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <Link
                    to="/properties"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#6B7C8E",
                        textDecoration: "none",
                        fontSize: "14px",
                        fontWeight: "500"
                    }}
                >
                    <FaArrowLeft /> Back to all properties
                </Link>

                {isOwner && (
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Link
                            to={`/properties/${property._id}/edit`}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "#D9A24C",
                                color: "#1B2733",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                textDecoration: "none",
                                fontSize: "13px",
                                fontWeight: "600"
                            }}
                        >
                            <FaEdit /> Edit
                        </Link>
                        <button
                            onClick={handleDelete}
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                background: "#FFF5F5",
                                color: "#E53E3E",
                                border: "1px solid #FEB2B2",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "13px",
                                fontWeight: "600"
                            }}
                        >
                            <FaTrash /> Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "32px"
            }}>
                {/* 1. Image Gallery Section */}
                <div style={{
                    background: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px solid #EDE7DA",
                    overflow: "hidden",
                    padding: "16px"
                }}>
                    {/* Large Featured Image View */}
                    <div style={{
                        position: "relative",
                        width: "100%",
                        height: "460px",
                        backgroundColor: "#1B2733",
                        borderRadius: "6px",
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <img
                            src={images.length > 0 ? getImageUrl(images[activeImageIndex]) : DEFAULT_PLACEHOLDER_IMAGE}
                            alt={property.title}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: images.length > 0 ? "cover" : "contain"
                            }}
                        />

                        {/* Navigation Arrows for Multiple Images */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    style={{
                                        position: "absolute",
                                        left: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "rgba(0, 0, 0, 0.55)",
                                        color: "#FFFFFF",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "38px",
                                        height: "38px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        transition: "background 0.2s"
                                    }}
                                    title="Previous photo"
                                >
                                    <FaChevronLeft />
                                </button>
                                <button
                                    onClick={nextImage}
                                    style={{
                                        position: "absolute",
                                        right: "14px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        background: "rgba(0, 0, 0, 0.55)",
                                        color: "#FFFFFF",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "38px",
                                        height: "38px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        fontSize: "14px",
                                        transition: "background 0.2s"
                                    }}
                                    title="Next photo"
                                >
                                    <FaChevronRight />
                                </button>

                                {/* Photo Counter Badge */}
                                <div style={{
                                    position: "absolute",
                                    bottom: "14px",
                                    right: "14px",
                                    background: "rgba(27, 39, 51, 0.75)",
                                    color: "#FFFFFF",
                                    padding: "4px 10px",
                                    borderRadius: "14px",
                                    fontSize: "12px",
                                    fontWeight: "500"
                                }}>
                                    {activeImageIndex + 1} / {images.length}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnails Row */}
                    {images.length > 1 && (
                        <div style={{
                            display: "flex",
                            gap: "10px",
                            marginTop: "14px",
                            overflowX: "auto",
                            paddingBottom: "4px"
                        }}>
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setActiveImageIndex(idx)}
                                    style={{
                                        border: activeImageIndex === idx ? "2px solid #D9A24C" : "1px solid #EDE7DA",
                                        borderRadius: "4px",
                                        overflow: "hidden",
                                        width: "80px",
                                        height: "60px",
                                        padding: 0,
                                        cursor: "pointer",
                                        flexShrink: 0,
                                        background: "#FAF7F2",
                                        opacity: activeImageIndex === idx ? 1 : 0.65,
                                        transition: "all 0.15s ease"
                                    }}
                                >
                                    <img
                                        src={getImageUrl(img)}
                                        alt={`Thumbnail ${idx + 1}`}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2. Details & Location Grid */}
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: "28px"
                }}>
                    {/* Left Column: Property Description & Features */}
                    <div style={{
                        background: "#FFFFFF",
                        borderRadius: "8px",
                        border: "1px solid #EDE7DA",
                        padding: "28px"
                    }}>
                        {/* Header Badges */}
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "12px" }}>
                            <span style={{
                                textTransform: "uppercase",
                                fontSize: "12px",
                                fontWeight: "600",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                background: property.listingType === "sale" ? "#EBF8FF" : "#FEFCBF",
                                color: property.listingType === "sale" ? "#2B6CB0" : "#B7791F"
                            }}>
                                {property.listingType === "sale" ? "For Sale" : "For Rent"}
                            </span>
                            <span style={{
                                textTransform: "capitalize",
                                fontSize: "12px",
                                fontWeight: "600",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                background: "#F7FAFC",
                                color: "#4A5568",
                                border: "1px solid #E2E8F0"
                            }}>
                                {property.propertyType}
                            </span>
                        </div>

                        <h1 style={{ fontSize: "28px", color: "#1B2733", margin: "0 0 10px", fontWeight: "600" }}>
                            {property.title}
                        </h1>

                        <p style={{ color: "#6B7C8E", fontSize: "15px", display: "flex", alignItems: "center", gap: "6px", margin: "0 0 20px" }}>
                            <FaMapMarkerAlt style={{ color: "#D9A24C" }} /> {property.location?.city}
                        </p>

                        <div style={{
                            fontSize: "28px",
                            fontWeight: "700",
                            color: "#1B2733",
                            paddingBottom: "20px",
                            borderBottom: "1px solid #EDE7DA",
                            marginBottom: "20px"
                        }}>
                            {property.price?.toLocaleString()} TND
                            {property.listingType === "rent" ? <span style={{ fontSize: "16px", color: "#6B7C8E", fontWeight: "400" }}> / month</span> : ""}
                        </div>

                        {/* Property Specs Pills */}
                        <div style={{
                            display: "flex",
                            gap: "16px",
                            flexWrap: "wrap",
                            marginBottom: "24px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FAF7F2", padding: "10px 16px", borderRadius: "6px" }}>
                                <FaRulerCombined style={{ color: "#D9A24C" }} />
                                <div>
                                    <div style={{ fontSize: "11px", color: "#8B96A3" }}>AREA</div>
                                    <strong style={{ color: "#1B2733", fontSize: "14px" }}>{property.area} m²</strong>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FAF7F2", padding: "10px 16px", borderRadius: "6px" }}>
                                <FaBed style={{ color: "#D9A24C" }} />
                                <div>
                                    <div style={{ fontSize: "11px", color: "#8B96A3" }}>BEDROOMS</div>
                                    <strong style={{ color: "#1B2733", fontSize: "14px" }}>{property.bedrooms ?? 0}</strong>
                                </div>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#FAF7F2", padding: "10px 16px", borderRadius: "6px" }}>
                                <FaBath style={{ color: "#D9A24C" }} />
                                <div>
                                    <div style={{ fontSize: "11px", color: "#8B96A3" }}>BATHROOMS</div>
                                    <strong style={{ color: "#1B2733", fontSize: "14px" }}>{property.bathrooms ?? 0}</strong>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 style={{ fontSize: "18px", color: "#1B2733", marginBottom: "10px" }}>Description</h3>
                            <p style={{ color: "#4A5568", lineHeight: "1.7", whiteSpace: "pre-line", fontSize: "15px" }}>
                                {property.description}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Contact & Interactive Map */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {/* Owner Contact Card */}
                        {property.owner && (
                            <div style={{
                                background: "#FFFFFF",
                                borderRadius: "8px",
                                border: "1px solid #EDE7DA",
                                padding: "24px"
                            }}>
                                <h3 style={{ fontSize: "17px", color: "#1B2733", margin: "0 0 16px" }}>
                                    Contact the Owner
                                </h3>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                    <div style={{
                                        width: "44px",
                                        height: "44px",
                                        borderRadius: "50%",
                                        background: "#1B2733",
                                        color: "#D9A24C",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: "18px"
                                    }}>
                                        <FaUser />
                                    </div>
                                    <div>
                                        <strong style={{ display: "block", color: "#1B2733", fontSize: "16px" }}>
                                            {property.owner.fullName}
                                        </strong>
                                        <span style={{ fontSize: "13px", color: "#8B96A3" }}>Property Owner</span>
                                    </div>
                                </div>

                                {property.owner.phone && (
                                    <a
                                        href={`tel:${property.owner.phone}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            background: "#1B2733",
                                            color: "#FFFFFF",
                                            padding: "12px",
                                            borderRadius: "6px",
                                            textDecoration: "none",
                                            fontWeight: "500",
                                            fontSize: "14px",
                                            marginBottom: "10px"
                                        }}
                                    >
                                        <FaPhone /> Call: {property.owner.phone}
                                    </a>
                                )}

                                {property.owner.email && (
                                    <a
                                        href={`mailto:${property.owner.email}?subject=Inquiry regarding: ${property.title}`}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            background: "#FAF7F2",
                                            color: "#1B2733",
                                            border: "1px solid #EDE7DA",
                                            padding: "11px",
                                            borderRadius: "6px",
                                            textDecoration: "none",
                                            fontWeight: "500",
                                            fontSize: "14px"
                                        }}
                                    >
                                        <FaEnvelope /> Email Owner: {property.owner.email}
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Interactive Location Map */}
                        {property.location?.latitude && property.location?.longitude && (
                            <div style={{
                                background: "#FFFFFF",
                                borderRadius: "8px",
                                border: "1px solid #EDE7DA",
                                padding: "20px"
                            }}>
                                <h3 style={{ fontSize: "17px", color: "#1B2733", margin: "0 0 12px" }}>
                                    Location on Map
                                </h3>
                                <div style={{ height: "260px", borderRadius: "6px", overflow: "hidden" }}>
                                    <MapContainer
                                        center={[property.location.latitude, property.location.longitude]}
                                        zoom={13}
                                        scrollWheelZoom={false}
                                        style={{ width: "100%", height: "100%" }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker position={[property.location.latitude, property.location.longitude]}>
                                            <Popup>
                                                <strong>{property.title}</strong>
                                                <br />
                                                {property.location.city}
                                            </Popup>
                                        </Marker>
                                    </MapContainer>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PropertyDetails;
