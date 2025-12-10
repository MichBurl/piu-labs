import { store } from './store.js';

const elements = {
    container: document.getElementById('shapes-container'),
    btnAddCircle: document.getElementById('add-circle'),
    btnAddSquare: document.getElementById('add-square'),
    btnColorCircles: document.getElementById('color-circles'),
    btnColorSquares: document.getElementById('color-squares'),
    countCircles: document.getElementById('count-circles'),
    countSquares: document.getElementById('count-squares')
};

// Funkcja tworząca element HTML kształtu
function createShapeElement(shape) {
    const div = document.createElement('div');
    div.classList.add('shape', shape.type);
    div.dataset.id = shape.id; // Kluczowe dla identyfikacji
    div.style.backgroundColor = shape.color;
    return div;
}

// Główna funkcja renderująca - aktualizuje DOM na podstawie stanu
function render(state) {
    const shapes = state.shapes;
    const existingIds = new Set();

    // 1. Aktualizacja lub dodanie nowych elementów
    shapes.forEach(shape => {
        existingIds.add(shape.id);
        let el = document.querySelector(`.shape[data-id="${shape.id}"]`);

        if (!el) {
            // Dodaj nowy, jeśli nie istnieje
            el = createShapeElement(shape);
            elements.container.appendChild(el);
        } else {
            // Aktualizuj istniejący (tylko jeśli kolor się zmienił)
            if (el.style.backgroundColor !== shape.color) {
                el.style.backgroundColor = shape.color;
            }
        }
    });

    // 2. Usunięcie elementów, których nie ma już w stanie
    // (Konwertujemy NodeList na Array, by móc po niej iterować bezpiecznie)
    Array.from(elements.container.children).forEach(el => {
        if (!existingIds.has(el.dataset.id)) {
            el.remove();
        }
    });

    // 3. Aktualizacja liczników
    const stats = store.getStats();
    elements.countCircles.innerText = stats.circles;
    elements.countSquares.innerText = stats.squares;
}

export function init() {
    // Subskrypcja store - renderuj przy każdej zmianie
    store.subscribe(render);

    // Initial render (dla danych z localStorage)
    render({ shapes: store.getShapes() });

    // Obsługa przycisków
    elements.btnAddCircle.addEventListener('click', () => store.addShape('circle'));
    elements.btnAddSquare.addEventListener('click', () => store.addShape('square'));
    
    elements.btnColorCircles.addEventListener('click', () => store.recolorByType('circle'));
    elements.btnColorSquares.addEventListener('click', () => store.recolorByType('square'));

    // Delegacja zdarzeń - usuwanie
    elements.container.addEventListener('click', (e) => {
        if (e.target.classList.contains('shape')) {
            const id = e.target.dataset.id;
            store.removeShape(id);
        }
    });
}