# Wholesaler360 - Accounting and Inventory Management Platform

🚀 **Try the Demo Now**: [Wholesaler360 Web App](https://wholesaler360-web-app.vercel.app/)  
🔑 **Super Admin Login**:  
- **Mobile No**: `9999999999`  
- **Password**: `Admin@1234`

---

## 📖 About Wholesaler360

Wholesaler360 is a **Full-stack Accounting and Inventory Management Platform** designed specifically for wholesalers. It simplifies managing purchases, sales, inventory, vendors, customers, and finances—all in one place. Built using the **MERN stack**, Wholesaler360 is optimized for performance, security, and scalability.

---

## 🌟 Key Features

### 🔐 **Role-Based Access Control (RBAC)**
- Dynamic **Role-Based Permission Model** using **Bitwise Operations** for efficient access checks.
- Multi-level authorization to restrict access per **module** and **operation** (Read/Write/Update/Delete).

### 📦 **Advanced Inventory Management**
- **FIFO-based stock tracking** for accurate inventory valuation.
- Batch-level metadata tracking (vendor, pricing, purchase date).
- Image support via **Cloudinary** with optional AI-generated images using **Pollination.ai**.

### 💳 **Vendor & Customer Management**
- Full **Ledger functionality** for tracking all Debit/Credit transactions.
- Real-time outstanding balance tracking.

### 📊 **Finance & Reporting**
- Aggregated financial metrics for **purchases**, **sales**, and **profitability**.
- Configurable invoice formats and financial summaries.

### ⚙️ **Configurable Backend Settings**
- Manage company profile, app preferences, account settings, and invoice templates.
- Admin-controlled settings for enhanced flexibility.

### 🖥️ **Frontend Dashboard**
- Built with **React.js** for a seamless user experience.
- Real-time data reflection via async API integration.
- Dynamic CRUD interfaces and form components.

---

## 🛠️ Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT-based authentication
- **Image Storage**: Cloudinary
- **AI Integration**: Pollination.ai

---

## 🚀 Optimizations

- **Performance**: Optimized database queries using **Indexing**, **Aggregation Pipelines**, and **Data Normalization**.
- **Security**: Secured APIs with JWT and multi-level authorization.
- **Efficiency**: Reduced repetitive iterations with **Bitwise Operations** for permission checks.

---

## 📂 Seeder Files

To get started quickly, Wholesaler360 includes **Seeder Files** to populate the database with initial data:

1. **Super Admin User**:  
   - Mobile No: `9999999999`  
   - Password: `Admin@1234`  
   - Role: Super Admin with full permissions.

---

## 🛠️ Installation & Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/your-repo/wholesaler360.git
   cd wholesaler360
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and configure the following:
   ```env
   ACCESS_TOKEN_SECRET=your_access_token_secret
   REFRESH_TOKEN_SECRET=your_refresh_token_secret
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   MONGO_URI=your_mongodb_connection_string
   CLOUDINARY_URL=your_cloudinary_url
   SMTP_HOST=your_smtp_host
   SMTP_PORT=your_smtp_port
   SMTP_EMAIL=your_smtp_email
   SMTP_PASSWORD=your_smtp_password
   ```

4. **Run Seeder Files**:
   Populate the database with initial data:
   ```bash
   npm run seed
   ```

5. **Start the Application**:
   ```bash
   npm start
   ```

6. **Access the App**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📈 Future Enhancements

- **Mobile App**: Extend functionality to mobile platforms.
- **AI Insights**: Use AI to provide actionable insights for inventory and sales.
- **Multi-Language Support**: Add localization for global users.

---

## 🤝 Contributing

We welcome contributions! Feel free to fork the repository, create a branch, and submit a pull request.

---

### Wholesaler360 Team

- [Priyanshu Baraiya](https://github.com/priyanshuahir000)  
- [Sharad Barad](https://github.com/sharadbarad)  
- [Ujas Makwana](https://github.com/UjasMakwana9)