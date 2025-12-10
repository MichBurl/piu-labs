// Generuje unikalne ID
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generuje losowy kolor HEX
export function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}