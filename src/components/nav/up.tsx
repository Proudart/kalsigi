'use client';

import React, { useState } from "react";
import { IconArrowUp } from "@tabler/icons-react";

const ScrollToTopButton: React.FC = () => {
    const [showButton, setShowButton] = useState(false);

    const handleScroll = () => {
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
        setShowButton(scrollPosition > 0);
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    React.useEffect(() => {
        window.addEventListener("scroll", handleScroll);
        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    return (
        showButton && (
            <button
                onClick={scrollToTop}
                className="fixed bottom-6 left-6 p-3 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors z-40"
                aria-label="Scroll to top"
            >
                <IconArrowUp className="w-4 h-4" />
            </button>
        )
    );
};

export default ScrollToTopButton;