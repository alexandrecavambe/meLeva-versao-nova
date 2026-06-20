const menuBtn = document.querySelector(".btn-menu");
const sidebar = document.getElementById("sidebar-top");
const overlay = document.querySelector(".overlay");

menuBtn.addEventListener("click", () => {
    sidebar.classList.add("active");
    overlay.classList.add("active");
    document.body.classList.add("menu-open");
});

overlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    document.body.classList.remove("menu-open");
});