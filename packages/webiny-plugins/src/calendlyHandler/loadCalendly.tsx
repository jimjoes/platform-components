export const loadCalendly = (callback: any) => {
    const existingScript = document.getElementById("calendlyScript");
    if (!existingScript) {
        const link = document.createElement("link");
        link.href = "https://calendly.com/assets/external/widget.css";
        link.rel = "stylesheet";

        const script = document.createElement("script");
        script.src = "https://calendly.com/assets/external/widget.js";
        script.id = "calendlyScript";
        script.type = "text/javascript";

        document.body.appendChild(link);
        document.body.appendChild(script);
        script.onload = () => {
            if (callback) {
                callback();
            }
        };
    }
    if (existingScript && callback) {
        callback();
    }
};
