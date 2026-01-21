SET REFERENTIAL_INTEGRITY FALSE;

TRUNCATE TABLE EMPLOYEES RESTART IDENTITY;
TRUNCATE TABLE CLIENTS RESTART IDENTITY;
TRUNCATE TABLE BOOKS RESTART IDENTITY;
TRUNCATE TABLE book_images RESTART IDENTITY;

SET REFERENTIAL_INTEGRITY TRUE;
INSERT INTO EMPLOYEES (BIRTH_DATE, EMAIL, NAME, PASSWORD, PHONE)
VALUES ('1990-05-15', 'john.doe@email.com', 'John Doe', 'pass123', '555-123-4567'),
       ('1985-09-20', 'jane.smith@email.com', 'Jane Smith', 'abc456', '555-987-6543'),
       ('1978-03-08', 'bob.jones@email.com', 'Bob Jones', 'qwerty789', '555-321-6789'),
       ('1982-11-25', 'alice.white@email.com', 'Alice White', 'secret567', '555-876-5432'),
       ('1995-07-12', 'mike.wilson@email.com', 'Mike Wilson', 'mypassword', '555-234-5678'),
       ('1989-01-30', 'sara.brown@email.com', 'Sara Brown', 'letmein123', '555-876-5433'),
       ('1975-06-18', 'tom.jenkins@email.com', 'Tom Jenkins', 'pass4321', '555-345-6789'),
       ('1987-12-04', 'lisa.taylor@email.com', 'Lisa Taylor', 'securepwd', '555-789-0123'),
       ('1992-08-22', 'david.wright@email.com', 'David Wright', 'access123', '555-456-7890'),
       ('1980-04-10', 'emily.harris@email.com', 'Emily Harris', '1234abcd', '555-098-7654');

INSERT INTO CLIENTS (BALANCE, EMAIL, NAME, PASSWORD)
VALUES (1000.00, 'client1@example.com', 'Medelyn Wright', 'password123'),
       (1500.50, 'client2@example.com', 'Landon Phillips', 'securepass'),
       (800.75, 'client3@example.com', 'Harmony Mason', 'abc123'),
       (1200.25, 'client4@example.com', 'Archer Harper', 'pass456'),
       (900.80, 'client5@example.com', 'Kira Jacobs', 'letmein789'),
       (1100.60, 'client6@example.com', 'Maximus Kelly', 'adminpass'),
       (1300.45, 'client7@example.com', 'Sierra Mitchell', 'mypassword'),
       (950.30, 'client8@example.com', 'Quinton Saunders', 'test123'),
       (1050.90, 'client9@example.com', 'Amina Clarke', 'qwerty123'),
       (880.20, 'client10@example.com', 'Bryson Chavez', 'pass789');


INSERT INTO BOOKS (name, genre, age_group, price, publication_date, author, pages, characteristics, description, language, quantity, isbn)
VALUES
    ('The Hidden Treasure', 'Adventure', 'ADULT', 24.99, '2018-05-15', 'Emily White', 400, 'Mysterious journey','An enthralling adventure', 'ENGLISH', 50, '978-3-16-148410-0'),
    ('Echoes of Eternity', 'Fantasy', 'TEEN', 16.50, '2011-01-15', 'Daniel Black', 350, 'Magical realms', 'A spellbinding tale', 'ENGLISH', 20, '978-1-40-289462-6'),
    ('Whispers in the Shadows', 'Mystery', 'ADULT', 29.95, '2018-08-11', 'Sophia Green', 450, 'Intriguing suspense','A gripping mystery', 'ENGLISH', 15, '978-0-74-327356-5'),
    ('The Starlight Sonata', 'Romance', 'ADULT', 21.75, '2011-05-15', 'Michael Rose', 320, 'Heartwarming love story','A beautiful journey', 'ENGLISH', 100, '978-0-06-112008-4'),
    ('Beyond the Horizon', 'Science Fiction', 'CHILD', 18.99, '2004-05-15', 'Alex Carter', 280,'Interstellar adventure', 'An epic sci-fi', 'ENGLISH', 30, '978-0-45-228423-4'),
    ('Dancing with Shadows', 'Thriller', 'ADULT', 26.50, '2015-05-15', 'Olivia Smith', 380, 'Suspenseful twists','A thrilling tale', 'ENGLISH', 12, '978-0-30-727767-1'),
    ('Voices in the Wind', 'Historical Fiction', 'ADULT', 32.00, '2017-05-15', 'William Turner', 500,'Rich historical setting', 'A compelling journey', 'ENGLISH', 5, '978-1-50-112634-9'),
    ('Serenade of Souls', 'Fantasy', 'TEEN', 15.99, '2013-05-15', 'Isabella Reed', 330, 'Enchanting realms','A magical fantasy', 'ENGLISH', 60, '978-0-55-338168-9'),
    ('Silent Whispers', 'Mystery', 'ADULT', 27.50, '2021-05-15', 'Benjamin Hall', 420, 'Intricate detective work','A mystery', 'ENGLISH', 25, '978-0-38-550420-1'),
    ('Whirlwind Romance', 'Romance', 'OTHER', 23.25, '2022-05-15', 'Emma Turner', 360, 'Passionate love affair','A romance', 'ENGLISH', 45, '978-1-25-008040-0');