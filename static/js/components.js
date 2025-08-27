// components.js - Reusable UI Components

class UIComponents {
  // Modal Component
  static createModal(title, content, options = {}) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal fade-in">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">${content}</div>
        ${options.footer ? `<div class="modal-footer">${options.footer}</div>` : ''}
      </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
  }

  // Alert Component
  static createAlert(message, type = 'info', duration = 5000) {
    const alertContainer = document.getElementById('alert-container') || this.createAlertContainer();
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} fade-in`;
    
    const icons = {
      success: 'fas fa-check-circle',
      warning: 'fas fa-exclamation-triangle',
      danger: 'fas fa-exclamation-circle',
      info: 'fas fa-info-circle'
    };
    
    alert.innerHTML = `
      <i class="${icons[type] || icons.info} alert-icon"></i>
      <span>${message}</span>
    `;
    
    alertContainer.appendChild(alert);
    
    if (duration > 0) {
      setTimeout(() => {
        alert.remove();
      }, duration);
    }
    
    return alert;
  }

  static createAlertContainer() {
    const container = document.createElement('div');
    container.id = 'alert-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 3000;
      max-width: 400px;
    `;
    document.body.appendChild(container);
    return container;
  }

  // Loading Overlay Component
  static createLoadingOverlay(target, message = 'Processing...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div style="text-align: center;">
        <div class="loading-spinner" style="margin-bottom: 1rem;"></div>
        <p style="margin: 0; color: var(--text-secondary);">${message}</p>
      </div>
    `;
    
    target.style.position = 'relative';
    target.appendChild(overlay);
    
    return {
      remove: () => overlay.remove(),
      updateMessage: (newMessage) => {
        overlay.querySelector('p').textContent = newMessage;
      }
    };
  }

  // Data Table Component
  static createDataTable(data, columns, options = {}) {
    if (!Array.isArray(data) || data.length === 0) {
      return '<p class="text-center text-secondary">No data available</p>';
    }

    const table = document.createElement('table');
    table.className = 'data-table';
    
    // Create header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    columns.forEach(column => {
      const th = document.createElement('th');
      th.textContent = column.title || column.key;
      if (column.width) th.style.width = column.width;
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Create body
    const tbody = document.createElement('tbody');
    
    data.forEach(row => {
      const tr = document.createElement('tr');
      
      columns.forEach(column => {
        const td = document.createElement('td');
        let value = row[column.key];
        
        if (column.formatter) {
          value = column.formatter(value, row);
        }
        
        td.innerHTML = value;
        tr.appendChild(td);
      });
      
      tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    return table;
  }

  // Badge Component
  static createBadge(text, type = 'info') {
    const badge = document.createElement('span');
    badge.className = `badge badge-${type}`;
    badge.textContent = text;
    return badge;
  }

  // Progress Bar Component
  static createProgressBar(percentage, options = {}) {
    const container = document.createElement('div');
    container.className = 'progress-bar';
    
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    
    if (options.animated) {
      fill.style.transition = 'width 0.3s ease';
    }
    
    container.appendChild(fill);
    
    return {
      element: container,
      update: (newPercentage) => {
        fill.style.width = `${Math.min(100, Math.max(0, newPercentage))}%`;
      }
    };
  }

  // Card Component
  static createCard(title, content, options = {}) {
    const card = document.createElement('div');
    card.className = 'card';
    
    let cardHTML = '';
    
    if (title) {
      cardHTML += `
        <div class="card-header">
          <h4 class="card-title">${title}</h4>
          ${options.actions ? `<div class="card-actions">${options.actions}</div>` : ''}
        </div>
      `;
    }
    
    cardHTML += `<div class="card-content">${content}</div>`;
    
    card.innerHTML = cardHTML;
    return card;
  }

  // Metric Card Component
  static createMetricCard(value, label, change = null) {
    const card = document.createElement('div');
    card.className = 'metric-card';
    
    let changeHTML = '';
    if (change !== null) {
      const changeClass = change >= 0 ? 'positive' : 'negative';
      const changeIcon = change >= 0 ? '↗' : '↘';
      changeHTML = `<div class="metric-change ${changeClass}">${changeIcon} ${Math.abs(change)}%</div>`;
    }
    
    card.innerHTML = `
      <div class="metric-value">${value}</div>
      <div class="metric-label">${label}</div>
      ${changeHTML}
    `;
    
    return card;
  }

  // Form Validation
  static validateForm(form) {
    const errors = {};
    const inputs = form.querySelectorAll('[required]');
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        errors[input.name] = `${input.dataset.label || input.name} is required`;
        input.classList.add('is-invalid');
      } else {
        input.classList.remove('is-invalid');
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Toast Notification
  static showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} fade-in`;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 3000;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Utility Functions
  static formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  static formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  static formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
  }

  // CSV Export Utility
  static exportToCSV(data, filename = 'export.csv') {
    if (!Array.isArray(data) || data.length === 0) {
      this.showToast('No data to export', 'warning');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => `"${(row[header] || '').toString().replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    this.showToast('File exported successfully', 'success');
  }
}

// Auto-initialize components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize tooltips
  document.querySelectorAll('[data-tooltip]').forEach(element => {
    element.addEventListener('mouseenter', (e) => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = e.target.dataset.tooltip;
      tooltip.style.cssText = `
        position: absolute;
        background: var(--dark-bg);
        color: var(--white);
        padding: 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        z-index: 1000;
        white-space: nowrap;
      `;
      
      document.body.appendChild(tooltip);
      
      const rect = e.target.getBoundingClientRect();
      tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
      tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
    });
    
    element.addEventListener('mouseleave', () => {
      document.querySelectorAll('.tooltip').forEach(t => t.remove());
    });
  });
});

// Export for use in other modules
window.UIComponents = UIComponents;
