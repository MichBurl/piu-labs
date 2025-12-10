import { generateId, getRandomColor } from './helpers.js';

class Store {
    constructor() {
        this.subscribers = [];
        this.state = {
            shapes: []
        };
        this.loadFromStorage();
    }

    // --- Observer Pattern ---
    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notify() {
        // Powiadamiamy wszystkich subskrybentów o nowym stanie
        this.subscribers.forEach(callback => callback(this.state));
        this.saveToStorage();
    }

    // --- LocalStorage ---
    saveToStorage() {
        localStorage.setItem('shapesAppState', JSON.stringify(this.state));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('shapesAppState');
        if (stored) {
            this.state = JSON.parse(stored);
        }
    }

    // --- Akcje zmieniające stan ---
    
    addShape(type) {
        const newShape = {
            id: generateId(),
            type: type, // 'circle' lub 'square'
            color: getRandomColor()
        };
        this.state.shapes.push(newShape);
        this.notify();
    }

    removeShape(id) {
        this.state.shapes = this.state.shapes.filter(shape => shape.id !== id);
        this.notify();
    }

    recolorByType(type) {
        this.state.shapes.forEach(shape => {
            if (shape.type === type) {
                shape.color = getRandomColor();
            }
        });
        this.notify();
    }

    // --- Gettery (Obliczenia) ---
    // Liczniki są wyliczane dynamicznie, nie są przechowywane jako zmienne
    getStats() {
        return {
            circles: this.state.shapes.filter(s => s.type === 'circle').length,
            squares: this.state.shapes.filter(s => s.type === 'square').length,
            total: this.state.shapes.length
        };
    }
    
    getShapes() {
        return this.state.shapes;
    }
}

// Eksportujemy jedną instancję (Singleton), aby cała appka korzystała z tego samego store
export const store = new Store();