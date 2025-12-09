import React, { useState, useMemo, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './App.css';
import {
  FaShoppingCart,
  FaDownload,
  FaPrint,
  FaPlus,
  FaTrashAlt,
  FaCalculator,
  FaFileInvoice,
  FaUser,
  FaCalendarAlt,
  FaRupeeSign,
  FaPercent,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaStore,
  FaTrash
} from 'react-icons/fa';

const App = () => {
  // Static fruit products
  const products = [
    { id: 1, name: 'Apple', price: 150, category: 'Fruits' },
    { id: 2, name: 'Banana', price: 80, category: 'Fruits' },
    { id: 3, name: 'Orange', price: 120, category: 'Fruits' },
    { id: 4, name: 'Mango', price: 250, category: 'Fruits' },
    { id: 5, name: 'Pineapple', price: 300, category: 'Fruits' },
    { id: 6, name: 'Watermelon', price: 450, category: 'Fruits' },
    { id: 7, name: 'Grapes', price: 280, category: 'Fruits' },
    { id: 8, name: 'Strawberry', price: 350, category: 'Fruits' },
    { id: 9, name: 'Kiwi', price: 180, category: 'Fruits' },
    { id: 10, name: 'Pomegranate', price: 220, category: 'Fruits' },
  ];

  // Generate unique invoice number
const generateUniqueInvoiceNumber = () => {
  return 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
};

  // Load from localStorage or use default
  const loadInitialInvoice = () => {
    const saved = localStorage.getItem('freshfruits_invoice');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      invoiceNumber: generateUniqueInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      companyName: 'FreshFruits Co.',
      companyEmail: 'sales@freshfruits.com',
      companyPhone: '+91 98765 43210',
      companyAddress: '123 Fruit Market, Kochi, Kerala 682001',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      items: [],
      taxRate: 0,
      discount: 0,
      notes: 'Thank you for your business! Please make payment within 7 days.',
      terms: 'Payment due within 7 days. Late payments subject to 1.5% monthly interest.',
    };
  };

  const [invoice, setInvoice] = useState(loadInitialInvoice);

  // Save to localStorage whenever invoice changes
  useEffect(() => {
    localStorage.setItem('freshfruits_invoice', JSON.stringify(invoice));
  }, [invoice]);

  // Format Indian Rupee properly for PDF
  const formatIndianRupee = (amount) => {
    const num = parseFloat(amount) || 0;
    return 'Rs. ' + num.toLocaleString('en-IN');
  };

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * (invoice.taxRate / 100);
    const discountAmount = subtotal * (invoice.discount / 100);
    const total = subtotal + tax - discountAmount;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      discount: discountAmount.toFixed(2),
      total: total.toFixed(2)
    };
  }, [invoice.items, invoice.taxRate, invoice.discount]);

  // Handle product selection
  const handleAddProduct = (product) => {
    const existingItemIndex = invoice.items.findIndex(item => item.productId === product.id);

    if (existingItemIndex >= 0) {
      const updatedItems = [...invoice.items];
      updatedItems[existingItemIndex].quantity += 1;
      setInvoice({ ...invoice, items: updatedItems });
    } else {
      const newItem = {
        id: Date.now(),
        productId: product.id,
        name: product.name,
        quantity: 1,
        price: product.price,
      };
      setInvoice({ ...invoice, items: [...invoice.items, newItem] });
    }
  };

  // Update item quantity
  const updateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    const updatedItems = invoice.items.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setInvoice({ ...invoice, items: updatedItems });
  };

  // Remove item
  const removeItem = (itemId) => {
    const updatedItems = invoice.items.filter(item => item.id !== itemId);
    setInvoice({ ...invoice, items: updatedItems });
  };

  // Clear All Data
  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      const freshInvoice = {
        invoiceNumber: generateUniqueInvoiceNumber(),
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        companyName: 'FreshFruits Co.',
        companyEmail: 'sales@freshfruits.com',
        companyPhone: '+91 98765 43210',
        companyAddress: '123 Fruit Market, Kochi, Kerala 682001',
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        customerAddress: '',
        items: [],
        taxRate: 0,
        discount: 0,
        notes: 'Thank you for your business! Please make payment within 7 days.',
        terms: 'Payment due within 7 days. Late payments subject to 1.5% monthly interest.',
      };
      setInvoice(freshInvoice);
      localStorage.removeItem('freshfruits_invoice');
    }
  };

  // Generate PDF with proper ₹ formatting
  const generatePDF = () => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(34, 197, 94);
    doc.text('FreshFruits Co.', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(invoice.companyAddress, 20, 30);
    doc.text(`Email: ${invoice.companyEmail}`, 20, 35);
    doc.text(`Phone: ${invoice.companyPhone}`, 20, 40);

    // Invoice Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('INVOICE', 150, 20);

    doc.setFontSize(10);
    doc.text(`Invoice #: ${invoice.invoiceNumber}`, 150, 30);
    doc.text(`Date: ${invoice.date}`, 150, 35);
    doc.text(`Due Date: ${invoice.dueDate}`, 150, 40);

    // Bill To
    doc.setFontSize(12);
    doc.text('Bill To:', 20, 60);
    doc.setFontSize(10);
    doc.text(invoice.customerName || 'Customer Name', 20, 68);
    doc.text(invoice.customerAddress || 'Address', 20, 73);
    doc.text(`Email: ${invoice.customerEmail || 'N/A'}`, 20, 78);
    doc.text(`Phone: ${invoice.customerPhone || 'N/A'}`, 20, 83);

    // Table Data
    const tableData = invoice.items.map((item, index) => [
      index + 1,
      item.name,
      formatIndianRupee(item.price),
      item.quantity,
      formatIndianRupee(item.price * item.quantity)
    ]);

    autoTable(doc, {
      startY: 100,
      head: [['S.No', 'Description', 'Price', 'Qty', 'Total']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [34, 197, 94] },
    });

    const finalY = doc.lastAutoTable.finalY + 20;

    // Summary
    doc.text('Subtotal:', 140, finalY);
    doc.text(formatIndianRupee(calculations.subtotal), 180, finalY);

    doc.text(`Tax (${invoice.taxRate}%):`, 140, finalY + 5);
    doc.text(formatIndianRupee(calculations.tax), 180, finalY + 5);

    doc.text(`Discount (${invoice.discount}%):`, 140, finalY + 10);
    doc.text('-' + formatIndianRupee(calculations.discount), 180, finalY + 10);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Total:', 140, finalY + 20);
    doc.text(formatIndianRupee(calculations.total), 180, finalY + 20);

    // Notes & Terms
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Notes:', 20, finalY + 30);
    doc.text(invoice.notes, 20, finalY + 35, { maxWidth: 170 });

    doc.text('Terms & Conditions:', 20, finalY + 50);
    doc.text(invoice.terms, 20, finalY + 55, { maxWidth: 170 });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', 105, 280, { align: 'center' });

    doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
  };

  const handlePrint = () => window.print();

  const handleInputChange = (field, value) => {
    setInvoice({ ...invoice, [field]: value });
  };

  // Add function to regenerate invoice number
  const regenerateInvoiceNumber = () => {
    setInvoice({
      ...invoice,
      invoiceNumber: generateUniqueInvoiceNumber()
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-2 sm:p-4 md:p-8 print:p-0">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-4 sm:mb-6 md:mb-8 print:hidden">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 sm:p-3 rounded-lg sm:rounded-xl shadow-lg">
                  <FaShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                    FreshFruits Billing
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">Invoice Generator</p>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <button
                  onClick={generatePDF}
                  className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-green-600 to-emerald-700 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-xs sm:text-sm md:text-base"
                >
                  <FaDownload className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1 sm:space-x-2 bg-white text-gray-700 border border-gray-200 px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-xs sm:text-sm md:text-base"
                >
                  <FaPrint className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Print</span>
                  <span className="sm:hidden">Print</span>
                </button>

                <button
                  onClick={clearAll}
                  className="flex items-center space-x-1 sm:space-x-2 bg-red-600 text-white px-3 sm:px-4 md:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 text-xs sm:text-sm md:text-base"
                >
                  <FaTrash className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden sm:inline">Clear All</span>
                  <span className="sm:hidden">Clear</span>
                </button>

                
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Left Column - Products & Customer Info */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6 md:space-y-8 print:hidden">
            {/* Products Grid */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <FaStore className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <span>Products</span>
                </h2>
                <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-block w-fit">
                  {products.length} items
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleAddProduct(product)}
                    className="group bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 text-left hover:border-green-300 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-sm sm:text-base text-gray-800 group-hover:text-green-700">
                        {product.name}
                      </span>
                      <span className="text-xs sm:text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                        ₹{product.price}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 sm:mb-3">{product.category}</p>
                    <div className="flex items-center text-green-600 text-xs sm:text-sm">
                      <FaPlus className="h-3 w-3 mr-1" />
                      <span>Add to invoice</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center space-x-2 mb-4 sm:mb-6">
                <FaUser className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span>Customer Information</span>
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={invoice.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="flex items-center">
                    <FaEnvelope className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                    <input
                      type="email"
                      placeholder="Enter customer email"
                      value={invoice.customerEmail}
                      onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex items-center">
                    <FaPhone className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2" />
                    <input
                      type="text"
                      placeholder="Enter phone number"
                      value={invoice.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 mr-2 mt-2" />
                    <textarea
                      placeholder="Enter address"
                      value={invoice.customerAddress}
                      onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                      rows="3"
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Invoice Preview */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 md:p-8 print:shadow-none print:p-0">
              {/* Invoice Header */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 print:mb-4 gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-2 rounded-lg">
                      <FaFileInvoice className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">INVOICE</h1>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600">FreshFruits Co. - Your Fresh Produce Partner</p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 bg-green-50 px-3 sm:px-4 py-2 rounded-lg inline-block break-all">
                    {invoice.invoiceNumber}
                  </div>
                </div>
              </div>

              {/* Company and Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 print:mb-4 border-b pb-6 sm:pb-8 print:pb-4">
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">From</h3>
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-base sm:text-lg font-bold text-gray-900">{invoice.companyName}</p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-start"><FaMapMarkerAlt className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-0.5 flex-shrink-0" />{invoice.companyAddress}</p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center"><FaEnvelope className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />{invoice.companyEmail}</p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center"><FaPhone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />{invoice.companyPhone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 sm:mb-3">Bill To</h3>
                  <div className="space-y-1 sm:space-y-2">
                    <p className="text-base sm:text-lg font-bold text-gray-900">{invoice.customerName || 'Walk-in Customer'}</p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-start"><FaMapMarkerAlt className="h-3 w-3 sm:h-4 sm:w-4 mr-2 mt-0.5 flex-shrink-0" />{invoice.customerAddress || '—'}</p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center"><FaEnvelope className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />{invoice.customerEmail || '—'}</p>
                    <p className="text-xs sm:text-sm text-gray-600 flex items-center"><FaPhone className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />{invoice.customerPhone || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Invoice Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 print:mb-4">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <FaCalendarAlt className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Invoice Date</span>
                  </div>
                  <input type="date" value={invoice.date} onChange={(e) => handleInputChange('date', e.target.value)} className="text-sm sm:text-lg font-bold text-gray-900 bg-transparent border-none focus:ring-0 w-full print:text-black" />
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <FaCalendarAlt className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Due Date</span>
                  </div>
                  <input type="date" value={invoice.dueDate} onChange={(e) => handleInputChange('dueDate', e.target.value)} className="text-sm sm:text-lg font-bold text-gray-900 bg-transparent border-none focus:ring-0 w-full print:text-black" />
                </div>
              </div>

              {/* Invoice Items Table */}
              <div className="mb-6 sm:mb-8 print:mb-4">
                <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-green-600 to-emerald-700">
                      <tr>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">S.No</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Description</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Price</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Qty</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">Total</th>
                        <th className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 text-left text-xs font-semibold text-white uppercase tracking-wider print:hidden">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invoice.items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">{index + 1}</td>
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
                            <div className="text-xs sm:text-sm font-medium text-gray-900">{item.name}</div>
                          </td>
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm text-gray-900 flex items-center">
                              <FaRupeeSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                              {item.price}
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <button 
                                onClick={() => updateItemQuantity(item.id, item.quantity - 1)} 
                                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 text-xs sm:text-sm"
                              >
                                -
                              </button>
                              <span className="w-8 sm:w-12 text-center font-medium text-xs sm:text-sm">{item.quantity}</span>
                              <button 
                                onClick={() => updateItemQuantity(item.id, item.quantity + 1)} 
                                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs sm:text-sm"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap">
                            <div className="text-xs sm:text-sm font-bold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                          </td>
                          <td className="px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 print:hidden">
                            <button 
                              onClick={() => removeItem(item.id)} 
                              className="text-red-600 hover:text-red-800 p-1 sm:p-2 hover:bg-red-50 rounded"
                            >
                              <FaTrashAlt className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {invoice.items.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No items added to invoice. Add products from the left panel.
                    </div>
                  )}
                </div>
              </div>

              {/* Notes, Terms and Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 print:mb-4">
                <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Notes</label>
                    <textarea 
                      value={invoice.notes} 
                      onChange={(e) => handleInputChange('notes', e.target.value)} 
                      rows="3" 
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent print:border-0 text-sm sm:text-base" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Terms & Conditions</label>
                    <textarea 
                      value={invoice.terms} 
                      onChange={(e) => handleInputChange('terms', e.target.value)} 
                      rows="2" 
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent print:border-0 text-sm sm:text-base" 
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-lg sm:rounded-2xl p-3 sm:p-4 md:p-6">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 flex items-center space-x-2">
                      <FaCalculator className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                      <span>Summary</span>
                    </h3>
                  </div>

                  <div className="space-y-2 sm:space-y-3 md:space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600">Subtotal</span>
                      <span className="text-xs sm:text-sm font-medium">₹{parseFloat(calculations.subtotal).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                        <FaPercent className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> 
                        Tax ({invoice.taxRate}%)
                      </span>
                      <span className="text-xs sm:text-sm font-medium">₹{parseFloat(calculations.tax).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                        <FaPercent className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> 
                        Discount ({invoice.discount}%)
                      </span>
                      <span className="text-xs sm:text-sm font-medium text-red-600">-₹{parseFloat(calculations.discount).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="border-t pt-2 sm:pt-3 md:pt-4 mt-2 sm:mt-3 md:mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-lg font-bold text-gray-800">Total</span>
                        <span className="text-base sm:text-xl md:text-2xl font-bold text-green-600">₹{parseFloat(calculations.total).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 sm:mt-4 md:mt-6 space-y-2 sm:space-y-3 print:hidden">
                    <div className="flex items-center space-x-2">
                      <label className="text-xs sm:text-sm text-gray-600">Tax:</label>
                      <input 
                        type="number" 
                        value={invoice.taxRate} 
                        onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value) || 0)} 
                        className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-center text-xs sm:text-sm" 
                        min="0" 
                        step="0.1" 
                      />
                      <span className="text-xs sm:text-sm text-gray-600">%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="text-xs sm:text-sm text-gray-600">Discount:</label>
                      <input 
                        type="number" 
                        value={invoice.discount} 
                        onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)} 
                        className="w-16 sm:w-20 px-2 py-1 border border-gray-300 rounded text-center text-xs sm:text-sm" 
                        min="0" 
                        step="0.1" 
                      />
                      <span className="text-xs sm:text-sm text-gray-600">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-4 sm:pt-6 md:pt-8 print:pt-4">
                <div className="text-center text-gray-600">
                  <p className="mb-1 sm:mb-2 text-xs sm:text-sm">Thank you for choosing FreshFruits Co.</p>
                  <p className="text-xs sm:text-sm">For questions, contact us at {invoice.companyEmail} or {invoice.companyPhone}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;