const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

// Validation schemas
const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(50).optional()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
    );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        { expiresIn: '7d' }
    );
};

const userController = {
    // Register new user
    async register(req, res) {
        try {
            // Validate input
            const { error, value } = registerSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    details: error.details[0].message
                });
            }

            const { email, password, name } = value;

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user
            const user = await User.create({
                email,
                password: hashedPassword,
                name: name || email.split('@')[0]
            });

            // Generate tokens
            const token = generateToken(user.id);
            const refreshToken = generateRefreshToken(user.id);

            // Save refresh token to user
            await User.updateRefreshToken(user.id, refreshToken);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        createdAt: user.createdAt
                    },
                    token,
                    refreshToken
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    // Login user
    async login(req, res) {
        try {
            // Validate input
            const { error, value } = loginSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    details: error.details[0].message
                });
            }

            const { email, password } = value;

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Generate tokens
            const token = generateToken(user.id);
            const refreshToken = generateRefreshToken(user.id);

            // Save refresh token to user
            await User.updateRefreshToken(user.id, refreshToken);

            // Update last login
            await User.updateLastLogin(user.id);

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        lastLogin: new Date().toISOString()
                    },
                    token,
                    refreshToken
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    // Logout user
    async logout(req, res) {
        try {
            const refreshToken = req.body.refreshToken;
            
            if (refreshToken) {
                // Remove refresh token from user
                await User.removeRefreshToken(refreshToken);
            }

            res.json({
                success: true,
                message: 'Logout successful'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    // Get current user
    async getMe(req, res) {
        try {
            const user = await User.findById(req.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        createdAt: user.createdAt,
                        lastLogin: user.lastLogin
                    }
                }
            });
        } catch (error) {
            console.error('Get user error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    },

    // Refresh token
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Refresh token required'
                });
            }

            // Verify refresh token
            const decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
            );

            // Check if user exists and refresh token is valid
            const user = await User.findById(decoded.userId);
            if (!user || user.refreshToken !== refreshToken) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid refresh token'
                });
            }

            // Generate new tokens
            const newToken = generateToken(user.id);
            const newRefreshToken = generateRefreshToken(user.id);

            // Update refresh token
            await User.updateRefreshToken(user.id, newRefreshToken);

            res.json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    token: newToken,
                    refreshToken: newRefreshToken
                }
            });
        } catch (error) {
            console.error('Refresh token error:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token'
            });
        }
    }
};

module.exports = userController;