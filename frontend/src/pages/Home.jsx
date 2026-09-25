import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    FaMapMarkerAlt,
    FaHome,
    FaBuilding,
    FaKey,
    FaArrowRight
} from "react-icons/fa";

import "../styles/Home.css";
import { getProperties } from "../services/propertyService";
import { getImageUrl } from "../utils/imageHelper";

function Home() {
    const [liveProperties, setLiveProperties] = useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchFeatured = async () => {
            try {
                const res = await getProperties();
                if (!isMounted) return;
                if (res.data && res.data.length > 0) {
                    setLiveProperties(res.data.slice(0, 3));
                }
            } catch {
                // Silently fallback to static featured properties
            }
        };

        fetchFeatured();

        return () => {
            isMounted = false;
        };
    }, []);

    const staticProperties = [
        {
            id: "static-1",
            title: "Modern Apartment",
            location: "Sfax, Tunisia",
            price: "180,000 TND",
            type: "For Sale",
            image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=900&q=80",
            link: "/properties"
        },
        {
            id: "static-2",
            title: "Beautiful Family House",
            location: "Moknine, Tunisia",
            price: "950 TND / month",
            type: "For Rent",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
            link: "/properties"
        },
        {
            id: "static-3",
            title: "Luxury Villa",
            location: "Sousse, Tunisia",
            price: "650,000 TND",
            type: "For Sale",
            image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=900&q=80",
            link: "/properties"
        }
    ];

    const displayProperties = liveProperties.length > 0
        ? liveProperties.map((p) => ({
            id: p._id,
            title: p.title,
            location: p.location?.city ? `${p.location.city}, Tunisia` : "Tunisia",
            price: `${p.price?.toLocaleString()} TND${p.listingType === "rent" ? " / month" : ""}`,
            type: p.listingType === "sale" ? "For Sale" : "For Rent",
            image: getImageUrl(p.images?.[0]),
            link: `/properties/${p._id}`
        }))
        : staticProperties;

    return (
        
        <main className="home">

            <section className="hero">

                <div className="hero-overlay"></div>

                <div className="hero-content">

                    <span className="hero-small-title">
                        FIND YOUR PLACE
                    </span>

                    <h1>
                        Find a place
                        <br />
                        <span>you can call home.</span>
                    </h1>

                    <p>
                        Discover houses, apartments and properties
                        available for sale or rent across Tunisia.
                    </p>

                </div>

            </section>



            {/* =========================
                CATEGORIES
            ========================= */}

            <section className="categories-section">

                <div className="section-heading">

                    <div>
                        <span>EXPLORE</span>

                        <h2>
                            Find the right property
                        </h2>
                    </div>

                    <Link to="/PropertyMap">
                        View all
                        <FaArrowRight />
                    </Link>

                </div>


                <div className="categories">

                    <Link
                        to="/PropertyMap"
                        className="category-card"
                    >
                        <div className="category-icon">
                            <FaHome />
                        </div>

                        <h3>
                            Houses
                        </h3>

                        <p>
                            Find your perfect house
                        </p>
                    </Link>


                    <Link
                        to="/PropertyMap"
                        className="category-card"
                    >
                        <div className="category-icon">
                            <FaBuilding />
                        </div>

                        <h3>
                            Apartments
                        </h3>

                        <p>
                            Modern apartments for every budget
                        </p>
                    </Link>


                    <Link
                        to="/PropertyMap"
                        className="category-card"
                    >
                        <div className="category-icon">
                            <FaKey />
                        </div>

                        <h3>
                            Rentals
                        </h3>

                        <p>
                            Find a place to rent
                        </p>
                    </Link>


                    <Link
                        to="/PropertyMap"
                        className="category-card"
                    >
                        <div className="category-icon">
                            <FaMapMarkerAlt />
                        </div>

                        <h3>
                            Land
                        </h3>

                        <p>
                            Discover available land
                        </p>
                    </Link>

                </div>

            </section>

            <section className="featured-section">

                <div className="section-heading">

                    <div>

                        <span>
                            FEATURED
                        </span>

                        <h2>
                            Properties you might like
                        </h2>

                    </div>

                    <Link to="/PropertyMap">
                        Browse properties
                        <FaArrowRight />
                    </Link>

                </div>


                <div className="property-grid">

                    {displayProperties.map((property) => (

                        <div
                            className="property-card"
                            key={property.id}
                        >

                            <div className="property-image">

                                <img
                                    src={property.image}
                                    alt={property.title}
                                    style={{ width: "100%", height: "220px", objectFit: "cover" }}
                                />

                                <span
                                    className={
                                        property.type === "For Rent"
                                            ? "property-badge rent"
                                            : "property-badge"
                                    }
                                >
                                    {property.type}
                                </span>

                            </div>


                            <div className="property-info">

                                <h3>
                                    {property.title}
                                </h3>

                                <p className="property-location">

                                    <FaMapMarkerAlt />

                                    {property.location}

                                </p>

                                <div className="property-bottom">

                                    <strong>
                                        {property.price}
                                    </strong>

                                    <Link to={property.link || "/properties"}>
                                        View
                                    </Link>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            </section>

            <section className="map-section">

                <div className="map-content">

                    <span>
                        EXPLORE THE MAP
                    </span>

                    <h2>
                        Find properties
                        <br />
                        around you.
                    </h2>

                    <p>
                        Browse properties directly on an interactive
                        map and discover what's available in your area.
                    </p>

                    <Link
                        to="/PropertyMap"
                        className="map-button"
                    >
                        Explore the map
                        <FaArrowRight />
                    </Link>

                </div>

                <div className="map-decoration">

                    <FaMapMarkerAlt />

                </div>

            </section>

            <section className="add-property-section">

                <div>

                    <span>
                        HAVE A PROPERTY?
                    </span>

                    <h2>
                        Want to sell or rent
                        your property?
                    </h2>

                    <p>
                        List your property on Dari and reach
                        people looking for their next home.
                    </p>

                </div>


                <Link
                    to="/AddProperty"
                    className="add-property-button"
                >
                    Add your property
                    <FaArrowRight />
                </Link>

            </section>


        </main>
    );
}

export default Home;