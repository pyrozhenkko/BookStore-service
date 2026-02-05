TRUNCATE TABLE employees RESTART IDENTITY CASCADE;
TRUNCATE TABLE clients RESTART IDENTITY CASCADE;
TRUNCATE TABLE book_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE cart_items RESTART IDENTITY CASCADE;
TRUNCATE TABLE shopping_carts RESTART IDENTITY CASCADE;
TRUNCATE TABLE orders RESTART IDENTITY CASCADE;
TRUNCATE TABLE book_ratings RESTART IDENTITY CASCADE;
TRUNCATE TABLE book_comments RESTART IDENTITY CASCADE;
TRUNCATE TABLE books RESTART IDENTITY CASCADE;
TRUNCATE TABLE book_images RESTART IDENTITY CASCADE;
TRUNCATE TABLE book_translations RESTART IDENTITY CASCADE;


INSERT INTO EMPLOYEES (BIRTH_DATE, EMAIL, NAME, PASSWORD, PHONE, IS_ADMIN, POSITION, HIRED_DATE, IS_BLOCKED)
VALUES ('1990-05-15', 'john.doe@email.com', 'John Doe', 'pass123', '555-123-4567', TRUE, 'ADMIN', '2015-06-01', FALSE),
       ('1985-09-20', 'jane.smith@email.com', 'Jane Smith', 'abc456', '555-987-6543', FALSE, 'EMPLOYEE', '2018-03-15', FALSE),
       ('1978-03-08', 'bob.jones@email.com', 'Bob Jones', 'qwerty789', '555-321-6789', FALSE, 'EMPLOYEE', '2019-11-20', FALSE),
       ('1982-11-25', 'alice.white@email.com', 'Alice White', 'secret567', '555-876-5432', FALSE, 'EMPLOYEE', '2020-02-10', FALSE),
       ('1995-07-12', 'mike.wilson@email.com', 'Mike Wilson', 'mypassword', '555-234-5678', FALSE, 'EMPLOYEE', '2023-05-05', FALSE),
       ('1989-01-30', 'sara.brown@email.com', 'Sara Brown', 'letmein123', '555-876-5433', FALSE, 'EMPLOYEE', '2022-08-12', FALSE),
       ('1975-06-18', 'tom.jenkins@email.com', 'Tom Jenkins', 'pass4321', '555-345-6789', FALSE, 'EMPLOYEE', '2010-09-01', FALSE),
       ('1987-12-04', 'lisa.taylor@email.com', 'Lisa Taylor', 'securepwd', '555-789-0123', FALSE, 'EMPLOYEE', '2016-12-12', FALSE),
       ('1992-08-22', 'david.wright@email.com', 'David Wright', 'access123', '555-456-7890', FALSE, 'EMPLOYEE', '2021-04-18', FALSE),
       ('1980-04-10', 'emily.harris@email.com', 'Emily Harris', '1234abcd', '555-098-7654', FALSE, 'EMPLOYEE', '2017-07-07', FALSE);

INSERT INTO CLIENTS (BALANCE, EMAIL, NAME, PASSWORD, PHONE, REGISTERED_DATE, IS_BLOCKED)
VALUES (100.00, 'pyrozhenkko@gmail.com', 'Medelyn Wright', 'password123', '+380501234567', '2023-01-15', FALSE),
       (0.00, 'client2@example.com', 'Landon Phillips', 'securepass', '+380502345678', '2023-02-20', FALSE),
       (0.00, 'client3@example.com', 'Harmony Mason', 'abc123', '+380503456789', '2023-03-25', FALSE),
       (0.00, 'client4@example.com', 'Archer Harper', 'pass456', '+380504567890', '2023-04-01', FALSE),
       (0.00, 'client5@example.com', 'Kira Jacobs', 'letmein789', '+380505678901', '2023-05-10', TRUE),
       (0.00, 'client6@example.com', 'Maximus Kelly', 'adminpass', '+380506789012', '2023-06-15', FALSE),
       (0.00, 'client7@example.com', 'Sierra Mitchell', 'mypassword', '+380507890123', '2023-07-20', FALSE),
       (0.00, 'client8@example.com', 'Quinton Saunders', 'test123', '+380508901234', '2023-08-05', FALSE),
       (0.00, 'client9@example.com', 'Amina Clarke', 'qwerty123', '+380509012345', '2023-09-12', FALSE),
       (0.00, 'client10@example.com', 'Bryson Chavez', 'pass789', '+380500123456', '2023-10-30', FALSE);

INSERT INTO BOOKS (name, genre, age_group, price, publication_date, author, pages, characteristics, description, language, quantity, isbn)
VALUES
    ('The Hidden Treasure', 'Adventure', 'ADULT', 240.99, '2018-05-15', 'Emily White', 400, 'Mysterious journey','An enthralling adventure', 'ENGLISH', 50, '978-3-16-148410-0'),
    ('Echoes of Eternity', 'Fantasy', 'TEEN', 160.50, '2011-01-15', 'Daniel Black', 350, 'Magical realms', 'A spellbinding tale', 'ENGLISH', 20, '978-1-40-289462-6'),
    ('Whispers in the Shadows', 'Mystery', 'ADULT', 290.95, '2018-08-11', 'Sophia Green', 450, 'Intriguing suspense','A gripping mystery', 'ENGLISH', 15, '978-0-74-327356-5'),
    ('The Starlight Sonata', 'Romance', 'ADULT', 210.75, '2011-05-15', 'Michael Rose', 320, 'Heartwarming love story','A beautiful journey', 'ENGLISH', 100, '978-0-06-112008-4'),
    ('Beyond the Horizon', 'Science Fiction', 'CHILD', 108.99, '2004-05-15', 'Alex Carter', 280,'Interstellar adventure', 'An epic sci-fi', 'ENGLISH', 30, '978-0-45-228423-4'),
    ('Dancing with Shadows', 'Thriller', 'ADULT', 260.50, '2015-05-15', 'Olivia Smith', 380, 'Suspenseful twists','A thrilling tale', 'ENGLISH', 12, '978-0-30-727767-1'),
    ('Voices in the Wind', 'Historical Fiction', 'ADULT', 302.00, '2017-05-15', 'William Turner', 500,'Rich historical setting', 'A compelling journey', 'ENGLISH', 5, '978-1-50-112634-9'),
    ('Serenade of Souls', 'Fantasy', 'TEEN', 150.99, '2013-05-15', 'Isabella Reed', 330, 'Enchanting realms','A magical fantasy', 'ENGLISH', 60, '978-0-55-338168-9'),
    ('Silent Whispers', 'Mystery', 'ADULT', 207.50, '2021-05-15', 'Benjamin Hall', 420, 'Intricate detective work','A mystery', 'ENGLISH', 25, '978-0-38-550420-1'),
    ('Whirlwind Romance', 'Romance', 'OTHER', 230.25, '2022-05-15', 'Emma Turner', 360, 'Passionate love affair','A romance', 'ENGLISH', 45, '978-1-25-008040-0');

INSERT INTO BOOK_TRANSLATIONS (book_id, locale, name, description, characteristics, genre)
SELECT id, 'en', name, description, characteristics, genre FROM BOOKS;

INSERT INTO BOOK_TRANSLATIONS (book_id, locale, name, description, characteristics, genre)
VALUES
(1, 'uk', 'Прихований скарб', 'Захоплююча пригода', 'Таємнична подорож', 'Пригоди'),
(2, 'uk', 'Відлуння вічності', 'Чарівна казка', 'Магічні світи', 'Фентезі'),
(3, 'uk', 'Шепоти в тінях', 'Захоплюючий детектив', 'Інтригуючий саспенс', 'Детектив'),
(4, 'uk', 'Соната зоряного світла', 'Прекрасна подорож', 'Зворушлива історія кохання', 'Романтика'),
(5, 'uk', 'За обрієм', 'Епічна наукова фантастика', 'Міжзоряна пригода', 'Наукова фантастика'),
(6, 'uk', 'Танець з тінями', 'Захоплююча історія', 'Напружені повороти', 'Трилер'),
(7, 'uk', 'Голоси вітру', 'Захоплююча подорож', 'Багате історичне тло', 'Історична фантастика'),
(8, 'uk', 'Серенада душ', 'Магічна фантазія', 'Чарівні світи', 'Фентезі'),
(9, 'uk', 'Тихі шепоти', 'Детектив', 'Складна детективна робота', 'Детектив'),
(10, 'uk', 'Вихор романтики', 'Романтика', 'Пристрасна любовна історія', 'Романтика');