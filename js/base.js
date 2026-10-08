document.addEventListener("DOMContentLoaded", () => {
    const p = document.body.dataset.page;

    document.querySelectorAll("[data-page]").forEach(a =>
        a.classList.toggle("active", a.dataset.page === p)
    );

    document.querySelector("#btnProjectInfo")?.addEventListener("click", () =>
        bootstrap.Modal.getOrCreateInstance(document.querySelector("#projectInfoModal")).show()
    );
});