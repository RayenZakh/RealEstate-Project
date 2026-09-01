import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import {
    MapContainer,
    TileLayer,
    Marker,
    Popup
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

function PropertyMap() {

    const { user } = useAuth();
    const currentUserId = user?.id;

    const [searchParams, setSearchParams] = useSearchParams();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    // Read the initial filter from the URL (?listingType=sale or ?listingType=rent),
    // so links like the footer's "Buy"/"Rent" actually pre-filter the list.
    // Falls back to "all" if there's no query param or it's an unrecognized value.
    const [listingType, setListingType] = useState(() => {
        const fromUrl = searchParams.get("listingType");
        return fromUrl === "sale" || fromUrl === "rent" ? fromUrl : "all";
    });

    const [propertyType, setPropertyType] = useState("all");
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Keep the URL in sync when the filter changes, so the current view stays
    // shareable/bookmarkable and browser back/forward works as expected.
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
        const fetchProperties = async () => {
            try {
                const response = await getProperties();
                setProperties(response.data);
            } catch (error) {
                console.error("Error loading properties:", error);
                setError("Could not load properties.");
            } finally {
                setLoading(false);
            }
        };

        fetchProperties();
    }, []);

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

        } catch (error) {
            console.error("Delete property error:", error);

            if (error.response) {
                alert(error.response.data.message || "Could not delete property.");
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
                        <div className="sidebar-property" key={property._id}>
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

                <Link to="/AddProperty" className="sidebar-add-button">
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

                    {filteredProperties.map((property) => (
                        <Marker
                            key={property._id}
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
                                            <button
                                                className="delete-property-btn"
                                                onClick={() => handleDelete(property._id)}
                                            >
                                                Delete Property
                                            </button>
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