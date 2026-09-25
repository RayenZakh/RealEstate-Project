import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaPlus, FaTrash, FaMapMarkerAlt, FaBuilding } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { getProperties, deleteProperty as deletePropertyRequest } from "../services/propertyService";
import { getImageUrl } from "../utils/imageHelper";

function Profile() {
    const { user } = useAuth();
    const [myProperties, setMyProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchMyListings = async () => {
            try {
                const response = await getProperties();
                if (!isMounted) return;
                const currentUserId = user?.id;
                const owned = response.data.filter((p) => {
                    const ownerId = typeof p.owner === "object" ? p.owner?._id : p.owner;
                    return ownerId === currentUserId;
                });
                setMyProperties(owned);
            } catch (err) {
                if (!isMounted) return;
                console.error("Error loading user properties:", err);
                setError("Could not load your listings.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchMyListings();

        return () => {
            isMounted = false;
        };
    }, [user?.id]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        try {
            await deletePropertyRequest(id);
            setMyProperties((prev) => prev.filter((p) => p._id !== id));
            alert("Property deleted successfully.");
        } catch (err) {
            console.error("Delete error:", err);
            alert(err.response?.data?.message || "Could not delete property.");
        }
    };

    return (
        <div style={{ maxWidth: "1160px", margin: "40px auto", padding: "0 24px", minHeight: "65vh" }}>
            <div style={{
                background: "#FFFFFF",
                borderRadius: "8px",
                border: "1px solid #EDE7DA",
                padding: "32px",
                marginBottom: "36px"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px" }}>
                    <div style={{
                        width: "56px",
                        height: "56px",
                        borderRadius: "50%",
                        background: "#1B2733",
                        color: "#D9A24C",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "24px"
                    }}>
                        <FaUser />
                    </div>
                    <div>
                        <h1 style={{ fontSize: "26px", color: "#1B2733", margin: 0, fontWeight: "600" }}>
                            {user?.fullName || "User Profile"}
                        </h1>
                        <p style={{ margin: "4px 0 0", color: "#6B7C8E", fontSize: "14px" }}>
                            Manage your Dari account and active listings
                        </p>
                    </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", borderTop: "1px solid #EDE7DA", paddingTop: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1B2733" }}>
                        <FaEnvelope style={{ color: "#D9A24C" }} />
                        <span><strong>Email:</strong> {user?.email}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#1B2733" }}>
                        <FaPhone style={{ color: "#D9A24C" }} />
                        <span><strong>Phone:</strong> {user?.phone}</span>
                    </div>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h2 style={{ fontSize: "22px", color: "#1B2733", margin: 0, fontWeight: "600" }}>
                        My Listings ({myProperties.length})
                    </h2>
                    <p style={{ margin: "4px 0 0", color: "#6B7C8E", fontSize: "14px" }}>
                        Properties you have published on the platform
                    </p>
                </div>
                <Link
                    to="/AddProperty"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#D9A24C",
                        color: "#1B2733",
                        padding: "10px 18px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "14px"
                    }}
                >
                    <FaPlus /> Add Property
                </Link>
            </div>

            {loading ? (
                <p style={{ color: "#6B7C8E" }}>Loading your listings...</p>
            ) : error ? (
                <p style={{ color: "#C53030" }}>{error}</p>
            ) : myProperties.length === 0 ? (
                <div style={{
                    background: "#FFFFFF",
                    borderRadius: "8px",
                    border: "1px dashed #D0D7DE",
                    padding: "48px 24px",
                    textAlign: "center"
                }}>
                    <FaBuilding style={{ fontSize: "40px", color: "#A0AEC0", marginBottom: "12px" }} />
                    <h3 style={{ color: "#1B2733", marginBottom: "8px" }}>No listings published yet</h3>
                    <p style={{ color: "#6B7C8E", marginBottom: "20px" }}>
                        Have a house, apartment, villa, or land you want to rent or sell?
                    </p>
                    <Link
                        to="/AddProperty"
                        style={{
                            background: "#1B2733",
                            color: "#FFFFFF",
                            padding: "10px 20px",
                            borderRadius: "6px",
                            textDecoration: "none",
                            fontWeight: "500",
                            fontSize: "14px"
                        }}
                    >
                        Publish Your First Property
                    </Link>
                </div>
            ) : (
                <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "20px"
                }}>
                    {myProperties.map((property) => (
                        <div
                            key={property._id}
                            style={{
                                background: "#FFFFFF",
                                borderRadius: "8px",
                                border: "1px solid #EDE7DA",
                                overflow: "hidden",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <div>
                                <div style={{ height: "150px", overflow: "hidden", background: "#F5F2EC", position: "relative" }}>
                                    <img
                                        src={getImageUrl(property.images?.[0])}
                                        alt={property.title}
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                    />
                                    <span style={{
                                        position: "absolute",
                                        top: "10px",
                                        left: "10px",
                                        fontSize: "11px",
                                        fontWeight: "600",
                                        textTransform: "uppercase",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        background: property.listingType === "sale" ? "#EBF8FF" : "#FEFCBF",
                                        color: property.listingType === "sale" ? "#2B6CB0" : "#B7791F",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                    }}>
                                        {property.listingType === "sale" ? "For Sale" : "For Rent"}
                                    </span>
                                </div>

                                <div style={{ padding: "18px 20px 8px" }}>
                                    <span style={{ fontSize: "12px", color: "#6B7C8E", textTransform: "capitalize" }}>
                                        {property.propertyType}
                                    </span>
                                    <h3 style={{ fontSize: "17px", color: "#1B2733", margin: "6px 0 8px" }}>
                                        <Link
                                            to={`/properties/${property._id}`}
                                            style={{ color: "inherit", textDecoration: "none" }}
                                        >
                                            {property.title}
                                        </Link>
                                    </h3>
                                    <p style={{ color: "#6B7C8E", fontSize: "13px", display: "flex", alignItems: "center", gap: "6px", margin: "4px 0" }}>
                                        <FaMapMarkerAlt /> {property.location?.city}
                                    </p>
                                    <p style={{ fontSize: "18px", fontWeight: "700", color: "#1B2733", margin: "10px 0 4px" }}>
                                        {property.price?.toLocaleString()} TND
                                        {property.listingType === "rent" ? " / mo" : ""}
                                    </p>
                                </div>
                            </div>

                            <div style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                borderTop: "1px solid #F0EBE1",
                                padding: "14px 20px",
                                marginTop: "10px"
                            }}>
                                <div style={{ display: "flex", gap: "12px" }}>
                                    <Link
                                        to={`/properties/${property._id}`}
                                        style={{
                                            color: "#1B2733",
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            textDecoration: "none"
                                        }}
                                    >
                                        Details
                                    </Link>
                                    <span style={{ color: "#D0D7DE" }}>|</span>
                                    <Link
                                        to={`/properties?id=${property._id}`}
                                        style={{
                                            color: "#6B7C8E",
                                            fontSize: "13px",
                                            fontWeight: "500",
                                            textDecoration: "none"
                                        }}
                                    >
                                        Map
                                    </Link>
                                </div>
                                <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                                    <Link
                                        to={`/properties/${property._id}/edit`}
                                        style={{
                                            color: "#D9A24C",
                                            fontSize: "13px",
                                            fontWeight: "600",
                                            textDecoration: "none"
                                        }}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(property._id)}
                                        style={{
                                            background: "transparent",
                                            border: "none",
                                            color: "#E53E3E",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                            fontSize: "13px",
                                            fontWeight: "500"
                                        }}
                                        title="Delete listing"
                                    >
                                        <FaTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Profile;
