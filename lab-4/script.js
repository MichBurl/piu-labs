document.addEventListener('DOMContentLoaded', () => {
    // Stan aplikacji
    let boardData = {
        todo: [],
        inprogress: [],
        done: []
    };

    // --- 1. Obsługa LocalStorage ---

    function saveToStorage() {
        localStorage.setItem('kanbanBoardData', JSON.stringify(boardData));
    }

    function loadFromStorage() {
        const saved = localStorage.getItem('kanbanBoardData');
        if (saved) {
            boardData = JSON.parse(saved);
        }
        renderBoard();
    }

    // --- 2. Funkcje pomocnicze ---

    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    function getRandomColor() {
        const colors = ['#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff', '#fffffc'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    function getNextColumn(currentCol) {
        if (currentCol === 'todo') return 'inprogress';
        if (currentCol === 'inprogress') return 'done';
        return null;
    }

    function getPrevColumn(currentCol) {
        if (currentCol === 'done') return 'inprogress';
        if (currentCol === 'inprogress') return 'todo';
        return null;
    }

    // --- 3. Renderowanie ---

    function createCardElement(card, columnId) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.setAttribute('data-id', card.id);
        cardDiv.style.backgroundColor = card.color;

        // Przycisk usuwania
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'card-btn btn-delete';
        deleteBtn.innerText = '✕';
        deleteBtn.title = "Usuń kartę";
        
        // Treść edytowalna
        const contentDiv = document.createElement('div');
        contentDiv.className = 'card-content';
        contentDiv.contentEditable = true;
        contentDiv.innerText = card.content;
        
        // Zapisywanie treści po zakończeniu edycji (blur)
        contentDiv.addEventListener('blur', () => {
            card.content = contentDiv.innerText;
            saveToStorage();
        });

        // Stopka z przyciskami akcji
        const footer = document.createElement('div');
        footer.className = 'card-footer';

        // Przycisk w lewo
        const prevBtn = document.createElement('button');
        prevBtn.className = 'card-btn';
        prevBtn.innerText = '←';
        if (!getPrevColumn(columnId)) prevBtn.style.visibility = 'hidden';
        else prevBtn.dataset.action = 'move-left';

        // Przycisk kolorowania pojedynczej karty
        const colorBtn = document.createElement('button');
        colorBtn.className = 'card-btn';
        colorBtn.innerText = '🎨';
        colorBtn.title = "Zmień kolor karty";
        colorBtn.dataset.action = 'color-card';

        // Przycisk w prawo
        const nextBtn = document.createElement('button');
        nextBtn.className = 'card-btn';
        nextBtn.innerText = '→';
        if (!getNextColumn(columnId)) nextBtn.style.visibility = 'hidden';
        else nextBtn.dataset.action = 'move-right';

        footer.appendChild(prevBtn);
        footer.appendChild(colorBtn);
        footer.appendChild(nextBtn);

        cardDiv.appendChild(deleteBtn);
        cardDiv.appendChild(contentDiv);
        cardDiv.appendChild(footer);

        return cardDiv;
    }

    function renderBoard() {
        ['todo', 'inprogress', 'done'].forEach(colId => {
            const columnEl = document.getElementById(colId);
            const listEl = columnEl.querySelector('.cards-list');
            const counterEl = columnEl.querySelector('.counter');

            listEl.innerHTML = ''; // Wyczyść listę
            
            // Renderuj karty
            boardData[colId].forEach(card => {
                const cardEl = createCardElement(card, colId);
                listEl.appendChild(cardEl);
            });

            // Aktualizuj licznik
            counterEl.innerText = boardData[colId].length;
        });
    }

    // --- 4. Logika biznesowa (Akcje) ---

    function handleAddCard(columnId) {
        const newCard = {
            id: generateId(),
            content: 'Nowe zadanie...',
            color: getRandomColor()
        };
        boardData[columnId].push(newCard);
        saveToStorage();
        renderBoard();
    }

    function handleColorColumn(columnId) {
        const newColor = getRandomColor();
        boardData[columnId].forEach(card => {
            card.color = newColor;
        });
        saveToStorage();
        renderBoard();
    }

    function handleSortColumn(columnId) {
        boardData[columnId].sort((a, b) => a.content.localeCompare(b.content));
        saveToStorage();
        renderBoard();
    }

    function deleteCard(cardId, columnId) {
        boardData[columnId] = boardData[columnId].filter(c => c.id !== cardId);
        saveToStorage();
        renderBoard();
    }

    function moveCard(cardId, fromCol, direction) {
        const cardIndex = boardData[fromCol].findIndex(c => c.id === cardId);
        if (cardIndex === -1) return;

        const card = boardData[fromCol][cardIndex];
        const targetCol = direction === 'left' ? getPrevColumn(fromCol) : getNextColumn(fromCol);

        if (targetCol) {
            // Usuń ze starej kolumny
            boardData[fromCol].splice(cardIndex, 1);
            // Dodaj do nowej
            boardData[targetCol].push(card);
            saveToStorage();
            renderBoard();
        }
    }

    function colorSingleCard(cardId, columnId) {
        const card = boardData[columnId].find(c => c.id === cardId);
        if (card) {
            card.color = getRandomColor();
            saveToStorage();
            renderBoard();
        }
    }

    // --- 5. Obsługa zdarzeń (Delegacja) ---

    // Nasłuchujemy kliknięć na całym kontenerze tablicy
    const boardContainer = document.querySelector('.board-container');

    boardContainer.addEventListener('click', (e) => {
        const target = e.target;
        
        // Znajdź kolumnę w której kliknięto
        const columnEl = target.closest('.column');
        if (!columnEl) return;
        const columnId = columnEl.dataset.id;

        // 1. Akcje nagłówka kolumny
        if (target.classList.contains('btn-action')) {
            const action = target.dataset.action;
            if (action === 'add') handleAddCard(columnId);
            if (action === 'color-col') handleColorColumn(columnId);
            if (action === 'sort') handleSortColumn(columnId);
        }

        // 2. Akcje karty
        const cardEl = target.closest('.card');
        if (cardEl) {
            const cardId = cardEl.dataset.id;

            if (target.classList.contains('btn-delete')) {
                deleteCard(cardId, columnId);
            }
            else if (target.dataset.action === 'move-left') {
                moveCard(cardId, columnId, 'left');
            }
            else if (target.dataset.action === 'move-right') {
                moveCard(cardId, columnId, 'right');
            }
            else if (target.dataset.action === 'color-card') {
                colorSingleCard(cardId, columnId);
            }
        }
    });

    // Start
    loadFromStorage();
});