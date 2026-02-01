# Система пошуку, пагінації та сортування

## Огляд

Всі сторінки зі списками та таблицями тепер підтримують повний функціонал пошуку, фільтрації, сортування та пагінації.

---

## Реалізовані функції по сторінках

### 1. **Сторінка "Працівники" (`EmployeesPage`)**

**Пошук:**
- За ім'ям працівника
- За email
- За посадою

**Фільтри:**
- Всі статуси
- Активні працівники
- Звільнені працівники

**Сортування:**
- Ім'я (А-Я / Я-А)
- Email (А-Я / Я-А)
- Посада (А-Я / Я-А)
- Дата прийому (стара-нова / нова-стара)

**Пагінація:**
- 10 працівників на сторінку
- Навігація "Назад" / "Вперед"
- Індикатор поточної сторінки

---

### 2. **Сторінка "Клієнти" (`ClientsPage`)**

**Пошук:**
- За ім'ям клієнта
- За email

**Фільтри:**
- Всі статуси
- Активні клієнти
- Заблоковані клієнти

**Сортування:**
- Ім'я (А-Я / Я-А)
- Email (А-Я / Я-А)
- Кількість замовлень (більше-менше / менше-більше)
- Дата реєстрації (стара-нова / нова-стара)

**Пагінація:**
- 10 клієнтів на сторінку
- Навігація "Назад" / "Вперед"
- Індикатор поточної сторінки

---

### 3. **Сторінка "Всі замовлення" (`AllOrdersPage`)**

**Пошук:**
- За ID замовлення
- За email клієнта
- За ім'ям клієнта
- За назвою книги

**Фільтри:**
- Всі статуси
- В обробці
- Підтверджені
- Скасовані

**Сортування:**
- Дата (нові спочатку / старі спочатку)
- Сума (більша-менша / менша-більша)
- Клієнт (А-Я / Я-А)

**Пагінація:**
- 5 замовлень на сторінку
- Навігація "Назад" / "Вперед"
- Індикатор поточної сторінки

---

### 4. **Сторінка "Керування книгами" (`ManageBooksPage`)**

**Пошук:**
- За назвою книги
- За автором
- За ISBN

**Фільтри:**
- Всі категорії / конкретна категорія
- Наявність:
  - Всі книги
  - В наявності
  - Мало на складі (< 10 шт)
  - Немає в наявності

**Сортування:**
- Назва (А-Я / Я-А)
- Автор (А-Я / Я-А)
- Ціна (зростання / спадання)
- Наявність (зростання / спадання)

**Пагінація:**
- 12 книг на сторінку
- Навігація "Назад" / "Вперед"
- Індикатор поточної сторінки

**Відображення:**
- Карткова сітка (grid)
- Адаптивний дизайн (1-4 колонки залежно від розміру екрану)

---

### 5. **Сторінка "Каталог книг" (`BookCatalog`) - для покупців**

**Пошук:**
- За назвою книги
- За автором
- За описом

**Фільтри:**
- Всі категорії / конкретна категорія

**Сортування:**
- За назвою
- За автором
- Ціна: за зростанням
- Ціна: за спаданням

**Пагінація:**
- 12 книг на сторінку
- Навігація "Назад" / "Вперед" з номерами сторінок
- Динамічна нумерація сторінок (показує до 5 номерів)
- Індикатор "Показано X з Y книг"

**Відображення:**
- Карткова сітка з BookCard компонентами
- Повідомлення "Нічого не знайдено" при порожніх результатах

---

### 6. **Сторінка "Мої замовлення" (`OrdersPage`) - для покупців**

**Пошук:**
- За ID замовлення
- За назвою книги

**Фільтри:**
- Всі статуси
- В обробці
- Підтверджені
- Скасовані

**Сортування:**
- Дата (нові спочатку / старі спочатку)
- Сума (більша-менша / менша-більша)

**Пагінація:**
- 5 замовлень на сторінку
- Навігація "Назад" / "Вперед"
- Індикатор поточної сторінки

**Відображення:**
- Карткове відображення з детальною інформацією
- Таблиця товарів у кожному замовленні
- Інформація про доставку Нова Пошта

---

## Технічна реалізація

### Архітектура

Всі компоненти використовують React hooks для управління станом:

```typescript
const [searchQuery, setSearchQuery] = useState('');
const [statusFilter, setStatusFilter] = useState<'all' | ...>('all');
const [sortBy, setSortBy] = useState<...>('...');
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
const [currentPage, setCurrentPage] = useState(1);
```

### Обробка даних

1. **Фільтрація**
   ```typescript
   const filteredAndSortedData = useMemo(() => {
     let result = [...data];
     // Пошук
     if (searchQuery) {
       result = result.filter(item => ...);
     }
     // Фільтрація
     if (filter !== 'all') {
       result = result.filter(item => ...);
     }
     // Сортування
     result.sort((a, b) => ...);
     return result;
   }, [data, searchQuery, filter, sortBy, sortOrder]);
   ```

2. **Пагінація**
   ```typescript
   const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
   const paginatedData = useMemo(() => {
     const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
     return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
   }, [filteredData, currentPage]);
   ```

3. **Автоматичне скидання сторінки**
   ```typescript
   useEffect(() => {
     setCurrentPage(1);
   }, [searchQuery, filter, sortBy, sortOrder]);
   ```

### UI компоненти

**Панель фільтрів:**
```tsx
<Card>
  <CardContent className="pt-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="relative">
        <Search className="..." />
        <Input placeholder="..." />
      </div>
      <Select>...</Select>
      <Select>...</Select>
    </div>
  </CardContent>
</Card>
```

**Пагінація:**
```tsx
<div className="flex items-center justify-between">
  <div className="text-sm text-gray-600">
    Сторінка {currentPage} з {totalPages}
  </div>
  <div className="flex gap-2">
    <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
      <ChevronLeft /> Назад
    </Button>
    <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
      Вперед <ChevronRight />
    </Button>
  </div>
</div>
```

---

## Налаштування

### Змінити кількість елементів на сторінку

В кожному компоненті знайдіть константу:
```typescript
const ITEMS_PER_PAGE = 10; // Змініть це значення
```

Рекомендовані значення:
- Таблиці: 10-20
- Картки (grid): 12-16
- Детальні записи: 5-10

### Додати нові поля пошуку

```typescript
if (searchQuery) {
  result = result.filter(item =>
    item.field1.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.field2.toLowerCase().includes(searchQuery.toLowerCase())
    // Додайте тут нові поля
  );
}
```

### Додати нові опції сортування

```typescript
<SelectContent>
  <SelectItem value="field-asc">Field (ascending)</SelectItem>
  <SelectItem value="field-desc">Field (descending)</SelectItem>
  {/* Додайте тут нові опції */}
</SelectContent>

// В логіці сортування:
switch (sortBy) {
  case 'field':
    compareValue = a.field - b.field; // або .localeCompare() для строк
    break;
  // Додайте тут нові випадки
}
```

---

## Продуктивність

### Оптимізація

1. **useMemo** - кешування відфільтрованих даних
2. **useEffect** - автоматичне скидання сторінки при зміні фільтрів
3. **Lazy calculation** - пагінація обчислюється тільки для поточних даних

### Рекомендації

- Для великих наборів даних (>1000 записів) розгляньте серверну пагінацію
- Використовуйте debounce для пошуку в реальному часі
- Кешуйте результати API запитів

---

## UX Features

### Індикатори стану

- "Завантаження..." під час fetch даних
- "Нічого не знайдено" при порожніх результатах
- "Показано X з Y" - лічильник результатів
- Disabled кнопки на краях пагінації

### Адаптивність

- Mobile-first дизайн
- Responsive grid layout
- Стекування фільтрів на малих екранах

### Доступність

- Semantic HTML
- ARIA labels на кнопках
- Keyboard navigation support

---

## Приклад використання

```typescript
// 1. Імпорт залежностей
import { useState, useEffect, useMemo } from 'react';

// 2. Константа для пагінації
const ITEMS_PER_PAGE = 10;

// 3. Стан компонента
const [data, setData] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [currentPage, setCurrentPage] = useState(1);

// 4. Обробка даних
const filtered = useMemo(() => {
  return data.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [data, searchQuery]);

// 5. Пагінація
const paginated = useMemo(() => {
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  return filtered.slice(start, start + ITEMS_PER_PAGE);
}, [filtered, currentPage]);

// 6. Рендер з UI компонентами
```

---

## Майбутні покращення

- [ ] Серверна пагінація для великих датасетів
- [ ] Debounce для пошуку
- [ ] Збереження фільтрів в URL query params
- [ ] Export результатів (CSV/PDF)
- [ ] Bulk operations на обрані записи
- [ ] Advanced фільтри (date range, multi-select)
- [ ] Збереження персональних налаштувань користувача

---

**Примітка:** Всі функції протестовані з mock даними та готові до інтеграції з вашим Java бекендом.
