import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "../styles/PropertyMap.css";

import L from "leaflet";
import { getProperties, deleteProperty as deletePropertyRequest } from "../services/propertyService";
import { useAuth } from "../hooks/useAuth";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

// Direct map manipulation component: uses useMap hook to pan/zoom when a property is selected
function MapController({ selectedPosition }) {
    const map = useMap();

    useEffect(() => {
        if (selectedPosition) {
            map.flyTo(selectedPosition, 14, { duration: 1.2 });
        }
    }, [selectedPosition, map]);

    return null;
}

function PropertyMap() {

    const { user } = useAuth();
    const currentUserId = user?.id;

    const [searchParams, setSearchParams] = useSearchParams();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    const [selectedPosition, setSelectedPosition] = useState(null);
    const [selectedPropertyId, setSelectedPropertyId] = useState(null);
    const markerRefs = useRef({});

    // Read the initial filter from the URL (?listingType=sale or ?listingType=rent)
    const [listingType, setListingType] = useState(() => {
        const fromUrl = searchParams.get("listingType");
        return fromUrl === "sale" || fromUrl === "rent" ? fromUrl : "all";
    });

    const [propertyType, setPropertyType] = useState("all");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleListingTypeChange = (value) => {
        setListingType(value);

        const nextParams = new URLSearchParams(searchParams);

        if (value === "all") {
            nextParams.delete("listingType");
        } else {
            nextParams.set("listingType", value);
        }

        setSearchParams(nextParams);
    };

    const defaultPosition = [34.0, 9.0];

    useEffect(() => {
        let isMounted = true;

        const fetchProperties = async () => {
            try {
                const response = await getProperties();
                if (!isMounted) return;
                setProperties(response.data);

                // If URL has ?id=..., highlight that property on load
                const targetId = searchParams.get("id");
                if (targetId) {
                    const target = response.data.find((p) => p._id === targetId);
                    if (target) {
                        setSelectedPropertyId(target._id);
                        setSelectedPosition([target.location.latitude, target.location.longitude]);
                        setTimeout(() => {
                            const marker = markerRefs.current[target._id];
                            if (marker) marker.openPopup();
                        }, 500);
                    }
                }
            } catch (err) {
                if (!isMounted) return;
                console.error("Error loading properties:", err);
                setError("Could not load properties.");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchProperties();

        return () => {
            isMounted = false;
        };
    }, [searchParams]);

    const handleSelectProperty = (property) => {
        setSelectedPosition([property.location.latitude, property.location.longitude]);
        setSelectedPropertyId(property._id);
        const marker = markerRefs.current[property._id];
        if (marker) {
            marker.openPopup();
        }
    };

    const handleDelete = async (propertyId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this property?"
        );

        if (!confirmDelete) return;

        try {
            await deletePropertyRequest(propertyId);

            setProperties(previous =>
                previous.filter(property => property._id !== propertyId)
            );

            alert("Property deleted successfully.");

        } catch (err) {
            console.error("Delete property error:", err);

            if (err.response) {
                alert(err.response.data.message || "Could not delete property.");
            } else {
                alert("Could not connect to the server.");
            }
        }
    };

    const filteredProperties = properties.filter((property) => {
        const matchesSearch =
            property.title.toLowerCase().includes(search.toLowerCase()) ||
            property.location.city.toLowerCase().includes(search.toLowerCase());

        const matchesListingType =
            listingType === "all" || property.listingType === listingType;

        const matchesPropertyType =
            propertyType === "all" || property.propertyType === propertyType;

        return matchesSearch && matchesListingType && matchesPropertyType;
    });

    return (
        <div className={`property-map-page ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

            <aside className="property-sidebar">

                <button
                    className="sidebar-toggle"
                    onClick={() => setSidebarOpen(false)}
                    title="Hide sidebar"
                >
                    ‹
                </button>

                <div className="sidebar-header">
                    <span>DARI PROPERTIES</span>
                    <h1>Find your next home</h1>
                    <p>Explore properties available across Tunisia.</p>
                </div>

                <div className="map-search">
                    <input
                        type="text"
                        placeholder="Search city or property..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <label>Looking for</label>
                    <div className="filter-buttons">
                        <button
                            className={listingType === "all" ? "active" : ""}
                            onClick={() => handleListingTypeChange("all")}
                        >
                            All
                        </button>
                        <button
                            className={listingType === "sale" ? "active" : ""}
                            onClick={() => handleListingTypeChange("sale")}
                        >
                            Buy
                        </button>
                        <button
                            className={listingType === "rent" ? "active" : ""}
                            onClick={() => handleListingTypeChange("rent")}
                        >
                            Rent
                        </button>
                    </div>
                </div>

                <div className="filter-group">
                    <label>Property type</label>
                    <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                    >
                        <option value="all">All types</option>
                        <option value="house">House</option>
                        <option value="apartment">Apartment</option>
                        <option value="villa">Villa</option>
                        <option value="land">Land</option>
                    </select>
                </div>

                <div className="result-count">
                    {loading ? "Loading..." : `${filteredProperties.length} properties found`}
                </div>

                <div className="sidebar-properties">
                    {filteredProperties.map((property) => (
                        <div
                            className={`sidebar-property ${selectedPropertyId === property._id ? "selected" : ""}`}
                            key={property._id}
                            onClick={() => handleSelectProperty(property)}
                        >
                            <div>
                                <span className={`property-type-badge ${property.listingType}`}>
                                    {property.listingType === "sale" ? "For Sale" : "For Rent"}
                                </span>
                                <h3>{property.title}</h3>
                                <p>{property.location.city}</p>
                                <strong>
                                    {property.price.toLocaleString()} TND
                                    {property.listingType === "rent" ? " / month" : ""}
                                </strong>
                            </div>
                        </div>
                    ))}
                </div>

                <Link to="/add-property" className="sidebar-add-button">
                    + Add your property
                </Link>

            </aside>

            {!sidebarOpen && (
                <button
                    className="sidebar-open-button"
                    onClick={() => setSidebarOpen(true)}
                    title="Show properties"
                >
                    ›
                </button>
            )}

            <div className="map-wrapper">

                {error && <div className="map-error">{error}</div>}

                <MapContainer
                    center={defaultPosition}
                    zoom={6}
                    zoomControl={false}
                    scrollWheelZoom={true}
                    className="leaflet-map"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MapController selectedPosition={selectedPosition} />

                    {filteredProperties.map((property) => (
                        <Marker
                            key={property._id}
                            ref={(ref) => {
                                if (ref) markerRefs.current[property._id] = ref;
                            }}
                            position={[property.location.latitude, property.location.longitude]}
                        >
                            <Popup>
                                <div className="map-popup">

                                    <h3>{property.title}</h3>
                                    <p>{property.location.city}</p>
                                    <strong>{property.price.toLocaleString()} TND</strong>

                                    <div className="popup-details">
                                        <span>{property.propertyType}</span>
                                        <span>{property.area} m²</span>
                                    </div>

                                    {property.owner && (
                                        <div className="owner-contact">
                                            <h4>Contact the owner</h4>
                                            <p><strong>{property.owner.fullName}</strong></p>
                                            {property.owner.phone ? (
                                                <p>{property.owner.phone}</p>
                                            ) : (
                                                <p>Phone number unavailable</p>
                                            )}
                                        </div>
                                    )}

                                    {currentUserId &&
                                        property.owner &&
                                        currentUserId === (
                                            typeof property.owner === "object"
                                                ? property.owner._id
                                                : property.owner
                                        ) && (
                                            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                                                <Link
                                                    to={`/properties/${property._id}/edit`}
                                                    style={{
                                                        flex: 1,
                                                        textAlign: "center",
                                                        padding: "7px 10px",
                                                        background: "#D9A24C",
                                                        color: "#1B2733",
                                                        borderRadius: "4px",
                                                        textDecoration: "none",
                                                        fontSize: "12px",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    className="delete-property-btn"
                                                    style={{ flex: 1, margin: 0 }}
                                                    onClick={() => handleDelete(property._id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}

                                </div>
                            </Popup>
                        </Marker>
                    ))}

                </MapContainer>

            </div>

        </div>
    );
}

export default PropertyMap;