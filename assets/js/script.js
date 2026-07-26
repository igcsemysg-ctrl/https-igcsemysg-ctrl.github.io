// ==============================
// IGCSEMYSG WEBSITE JAVASCRIPT
// ==============================


// Smooth reveal animation

const revealElements = document.querySelectorAll(
    ".section, .info-card, .process-card, .subject-card, .trust-box div, .choose-grid div"
);


const observer = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if(entry.isIntersecting){

                entry.target.classList.add("show");

            }

        });

    },
    {
        threshold:0.15
    }
);



revealElements.forEach(element => {

    element.classList.add("hidden");

    observer.observe(element);

});





// Mobile navigation preparation

const nav = document.querySelector("nav");


// Close dropdown if user clicks outside

document.addEventListener(
    "click",
    function(event){

        if(nav && !event.target.closest(".navbar")){

            nav.classList.remove("active");

        }

    }
);
