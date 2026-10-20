CREATE TABLE search_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    search_type VARCHAR(20) NOT NULL,
    search_value VARCHAR(150) NOT NULL,
    post_office VARCHAR(150) NOT NULL,
    district VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);