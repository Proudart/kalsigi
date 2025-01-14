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
        <div onClick={scrollToTop} className={`fixed z-50 bottom-7 left-4 ${showButton ? 'opacity-100 transition-opacity duration-300' : 'opacity-0 transition-opacity duration-300 hidden'}`}>
            <IconArrowUp className="w-8 h-8 p-1 text-2xl text-white rounded-full bg-primary-500 border border-white" />
        </div>
    );
};

export default ScrollToTopButton;
