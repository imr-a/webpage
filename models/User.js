const fs = require('fs').promises;
const path = require('path');
const { randomBytes } = require('crypto');

// Simple file-based user storage (in production, use a proper database)
const USERS_FILE = path.join(__dirname, '../data/users.json');

// Generate simple UUID using crypto
const generateId = () => {
    return randomBytes(16).toString('hex');
};

class User {
    constructor(userData) {
        this.id = userData.id || generateId();
        this.email = userData.email;
        this.password = userData.password;
        this.name = userData.name;
        this.createdAt = userData.createdAt || new Date().toISOString();
        this.lastLogin = userData.lastLogin || null;
        this.refreshToken = userData.refreshToken || null;
    }

    // Initialize data directory
    static async initializeDataDirectory() {
        const dataDir = path.dirname(USERS_FILE);
        try {
            await fs.access(dataDir);
        } catch {
            await fs.mkdir(dataDir, { recursive: true });
        }

        try {
            await fs.access(USERS_FILE);
        } catch {
            await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2));
        }
    }

    // Load all users from file
    static async loadUsers() {
        try {
            await this.initializeDataDirectory();
            const data = await fs.readFile(USERS_FILE, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    }

    // Save users to file
    static async saveUsers(users) {
        try {
            await this.initializeDataDirectory();
            await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        } catch (error) {
            console.error('Error saving users:', error);
            throw error;
        }
    }

    // Create new user
    static async create(userData) {
        const users = await this.loadUsers();
        const user = new User(userData);
        users.push(user);
        await this.saveUsers(users);
        return user;
    }

    // Find user by email
    static async findByEmail(email) {
        const users = await this.loadUsers();
        const userData = users.find(user => user.email === email);
        return userData ? new User(userData) : null;
    }

    // Find user by ID
    static async findById(id) {
        const users = await this.loadUsers();
        const userData = users.find(user => user.id === id);
        return userData ? new User(userData) : null;
    }

    // Update user's refresh token
    static async updateRefreshToken(userId, refreshToken) {
        const users = await this.loadUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].refreshToken = refreshToken;
            await this.saveUsers(users);
            return true;
        }
        return false;
    }

    // Update user's last login
    static async updateLastLogin(userId) {
        const users = await this.loadUsers();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex !== -1) {
            users[userIndex].lastLogin = new Date().toISOString();
            await this.saveUsers(users);
            return true;
        }
        return false;
    }

    // Remove refresh token (logout)
    static async removeRefreshToken(refreshToken) {
        const users = await this.loadUsers();
        const userIndex = users.findIndex(user => user.refreshToken === refreshToken);
        
        if (userIndex !== -1) {
            users[userIndex].refreshToken = null;
            await this.saveUsers(users);
            return true;
        }
        return false;
    }

    // Get all users (admin function)
    static async getAll() {
        const users = await this.loadUsers();
        return users.map(userData => new User(userData));
    }

    // Delete user by ID
    static async deleteById(userId) {
        const users = await this.loadUsers();
        const filteredUsers = users.filter(user => user.id !== userId);
        
        if (filteredUsers.length !== users.length) {
            await this.saveUsers(filteredUsers);
            return true;
        }
        return false;
    }
}

module.exports = User;