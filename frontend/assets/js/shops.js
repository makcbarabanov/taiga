// ===========================================
// Страница - Справочник магазинов
// ===========================================

let shops = [];

// Загрузка данных при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    // Проверяем, что api.js загружен
    if (typeof shopsAPI === 'undefined') {
        console.error('shopsAPI не определён. Убедитесь, что api.js загружен перед shops.js');
        document.getElementById('shops-tbody').innerHTML = 
            '<tr><td colspan="7" class="empty-state">Ошибка: shopsAPI не определён. Обновите страницу (Ctrl+F5 для очистки кэша).</td></tr>';
        return;
    }
    await loadShops();
});

// Загрузка магазинов
async function loadShops() {
    try {
        const tbody = document.getElementById('shops-tbody');
        tbody.innerHTML = '<tr><td colspan="7" class="loading">Загрузка...</td></tr>';
        
        // Проверяем, что shopsAPI доступен
        if (typeof shopsAPI === 'undefined') {
            throw new Error('shopsAPI не определён. Проверьте, что api.js загружен.');
        }
        
        shops = await shopsAPI.getAll();
        console.log('Загружено магазинов:', shops.length);
        
        renderShops();
    } catch (error) {
        console.error('Ошибка загрузки магазинов:', error);
        document.getElementById('shops-tbody').innerHTML = 
            '<tr><td colspan="8" class="empty-state">Ошибка загрузки данных: ' + error.message + '</td></tr>';
    }
}

// Отображение магазинов
function renderShops() {
    const tbody = document.getElementById('shops-tbody');
    
    if (shops.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="empty-state">Нет магазинов</td></tr>';
        return;
    }
    
    tbody.innerHTML = shops.map((shop, index) => {
        // Форматируем телефоны: разделяем по запятой и выводим вертикально
        let phoneDisplay = '-';
        if (shop.phone) {
            const phones = shop.phone.split(',').map(p => p.trim()).filter(p => p);
            phoneDisplay = phones.length > 0 
                ? phones.map(p => escapeHtml(p)).join('<br>')
                : '-';
        }
        
        return `
        <tr>
            <td>${index + 1}</td>
            <td><strong>${escapeHtml(shop.name || '-')}</strong></td>
            <td class="phone-cell">${phoneDisplay}</td>
            <td>${escapeHtml(shop.address || '-')}</td>
            <td>${escapeHtml(shop.working_hours || '-')}</td>
            <td>${escapeHtml(shop.contact_person || '-')}</td>
            <td class="website-cell">
                ${shop.website ? `
                    <a href="${escapeHtml(shop.website)}" target="_blank" rel="noopener noreferrer" title="Открыть сайт" class="icon-link">
                        🌐
                    </a>
                    <button onclick="copyWebsite(${JSON.stringify(shop.website)})" title="Копировать адрес сайта" class="icon-button">
                        📋
                    </button>
                ` : '-'}
            </td>
            <td class="actions-cell">
                <button 
                    onclick="editShop(${shop.id})"
                    title="Редактировать"
                    class="action-btn edit-btn"
                >✏️</button>
                <button 
                    onclick="deleteShop(${shop.id})"
                    title="Удалить"
                    class="action-btn delete-btn"
                >✕</button>
            </td>
        </tr>
    `;
    }).join('');
}

// Экранирование HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Копирование адреса сайта в буфер обмена
function copyWebsite(url) {
    navigator.clipboard.writeText(url).then(() => {
        // Можно добавить уведомление, но без модального окна
        console.log('Адрес сайта скопирован:', url);
    }).catch(err => {
        console.error('Ошибка копирования:', err);
        alert('Не удалось скопировать адрес');
    });
}

// Удаление магазина
async function deleteShop(id) {
    if (!confirm('Вы уверены, что хотите удалить этот магазин?')) {
        return;
    }
    
    try {
        await shopsAPI.delete(id);
        await loadShops();
    } catch (error) {
        console.error('Ошибка удаления магазина:', error);
        alert('Ошибка удаления магазина: ' + (error.message || 'Неизвестная ошибка'));
    }
}

// Модальное окно: Добавить магазин
function openAddShopModal() {
    document.getElementById('shop-modal-title').textContent = 'Добавить магазин';
    document.getElementById('shop-id').value = '';
    document.getElementById('add-shop-form').reset();
    document.getElementById('add-shop-modal').style.display = 'block';
}

// Редактирование магазина
async function editShop(id) {
    try {
        const shop = await shopsAPI.getById(id);
        
        document.getElementById('shop-modal-title').textContent = 'Редактировать магазин';
        document.getElementById('shop-id').value = shop.id;
        document.getElementById('shop-name').value = shop.name || '';
        document.getElementById('shop-phone').value = shop.phone || '';
        document.getElementById('shop-address').value = shop.address || '';
        document.getElementById('shop-working-hours').value = shop.working_hours || '';
        document.getElementById('shop-contact-person').value = shop.contact_person || '';
        document.getElementById('shop-website').value = shop.website || '';
        
        document.getElementById('add-shop-modal').style.display = 'block';
    } catch (error) {
        console.error('Ошибка загрузки магазина:', error);
        alert('Ошибка загрузки магазина: ' + (error.message || 'Неизвестная ошибка'));
    }
}

function closeAddShopModal() {
    document.getElementById('add-shop-modal').style.display = 'none';
    document.getElementById('add-shop-form').reset();
    document.getElementById('shop-id').value = '';
}

// Закрытие модального окна при клике вне его
window.addEventListener('click', (event) => {
    const modal = document.getElementById('add-shop-modal');
    if (event.target === modal) {
        closeAddShopModal();
    }
});

// Обработка формы: Добавить/Редактировать магазин
document.getElementById('add-shop-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const shopId = formData.get('id');
    const data = {
        name: formData.get('name'),
        phone: formData.get('phone') || null,
        address: formData.get('address') || null,
        working_hours: formData.get('working_hours') || null,
        contact_person: formData.get('contact_person') || null,
        website: formData.get('website') || null
    };
    
    try {
        if (shopId) {
            // Редактирование
            await shopsAPI.update(shopId, data);
        } else {
            // Добавление
            await shopsAPI.create(data);
        }
        closeAddShopModal();
        await loadShops();
    } catch (error) {
        console.error('Ошибка сохранения магазина:', error);
        alert('Ошибка сохранения магазина: ' + (error.message || 'Неизвестная ошибка'));
    }
});

