import { LitElement, html, css } from 'lit';
import { tokenStyles } from '../shared-styles.js';

export class ArcFileUpload extends LitElement {
  static properties = {
    accept:    { type: String },
    multiple:  { type: Boolean },
    maxSize:   { type: Number, attribute: 'max-size' },
    disabled:  { type: Boolean, reflect: true },
    _files:    { state: true },
    _dragOver: { state: true },
    _error:    { state: true },
  };

  static styles = [
    tokenStyles,
    css`
      :host { display: block; font-family: var(--font-body); }
      :host([disabled]) { opacity: 0.4; pointer-events: none; }

      .dropzone {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--space-sm);
        padding: var(--space-xl) var(--space-lg);
        border: 2px dashed var(--border-default);
        border-radius: var(--radius-lg);
        background: var(--bg-surface);
        cursor: pointer;
        transition: border-color var(--transition-fast), background var(--transition-fast);
        text-align: center;
      }

      .dropzone:hover {
        border-color: var(--border-bright);
        background: var(--bg-card);
      }

      .dropzone.drag-over {
        border-color: rgba(var(--accent-primary-rgb), 0.4);
        background: rgba(var(--accent-primary-rgb), 0.05);
        box-shadow: var(--focus-glow);
      }

      .dropzone:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .upload-icon {
        font-size: var(--text-md);
        color: var(--text-muted);
        line-height: 1;
        transition: color var(--transition-fast);
      }

      .drag-over .upload-icon {
        color: var(--accent-primary);
      }

      .upload-text {
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      .upload-hint {
        font-size: var(--text-sm);
        color: var(--text-muted);
      }

      .browse-link {
        color: var(--accent-primary);
        text-decoration: underline;
        cursor: pointer;
      }

      input[type="file"] {
        display: none;
      }

      .file-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-xs);
        margin-top: var(--space-md);
      }

      .file-item {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
        padding: var(--space-xs) var(--space-sm);
        background: var(--bg-card);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        font-size: var(--text-sm);
        color: var(--text-secondary);
      }

      .file-icon {
        flex-shrink: 0;
        color: var(--text-muted);
        font-size: var(--text-sm);
      }

      .file-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: var(--text-primary);
      }

      .file-size {
        flex-shrink: 0;
        color: var(--text-muted);
        font-size: var(--text-sm);
      }

      .file-remove {
        flex-shrink: 0;
        background: none;
        border: none;
        color: var(--text-muted);
        cursor: pointer;
        font-size: var(--text-md);
        padding: 2px calc(var(--space-xs) + 2px); /* cosmetic 2px vertical for tight remove button */
        border-radius: var(--radius-sm);
        line-height: 1;
        transition: color var(--transition-fast), background var(--transition-fast);
      }

      .file-remove:hover {
        color: var(--color-error);
        background: var(--color-error-subtle);
      }

      .file-remove:focus-visible {
        outline: none;
        box-shadow: var(--focus-glow);
      }

      .error-message {
        margin-top: var(--space-xs);
        font-size: var(--text-sm);
        color: var(--color-error);
      }

      @media (prefers-reduced-motion: reduce) {
        :host *,
        :host *::before,
        :host *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `,
  ];

  constructor() {
    super();
    this.accept = '';
    this.multiple = false;
    this.maxSize = 0;
    this.disabled = false;
    this._files = [];
    this._dragOver = false;
    this._error = '';
  }

  _formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 1 : 0)} ${units[i]}`;
  }

  _validateFiles(fileList) {
    const files = [...fileList];
    this._error = '';

    if (this.maxSize > 0) {
      const oversized = files.filter(f => f.size > this.maxSize);
      if (oversized.length > 0) {
        this._error = `${oversized.map(f => f.name).join(', ')} exceeded max size of ${this._formatSize(this.maxSize)}`;
        return files.filter(f => f.size <= this.maxSize);
      }
    }

    return files;
  }

  _addFiles(fileList) {
    const valid = this._validateFiles(fileList);
    if (valid.length === 0) return;

    if (this.multiple) {
      this._files = [...this._files, ...valid];
    } else {
      this._files = [valid[0]];
    }

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: [...this._files] },
      bubbles: true,
      composed: true,
    }));
  }

  _removeFile(index) {
    const removed = this._files[index];
    this._files = this._files.filter((_, i) => i !== index);
    this._error = '';

    this.dispatchEvent(new CustomEvent('arc-remove', {
      detail: { value: removed, index },
      bubbles: true,
      composed: true,
    }));

    this.dispatchEvent(new CustomEvent('arc-change', {
      detail: { value: [...this._files] },
      bubbles: true,
      composed: true,
    }));
  }

  _handleClick() {
    this.shadowRoot.querySelector('input[type="file"]')?.click();
  }

  _handleInputChange(e) {
    if (e.target.files.length > 0) {
      this._addFiles(e.target.files);
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  }

  _handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    this._dragOver = true;
  }

  _handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    this._dragOver = false;
  }

  _handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    this._dragOver = false;

    if (e.dataTransfer?.files.length > 0) {
      this._addFiles(e.dataTransfer.files);
    }
  }

  _handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleClick();
    }
  }

  render() {
    return html`
      <div part="wrapper">
        <div
          class="dropzone ${this._dragOver ? 'drag-over' : ''}"
          part="dropzone"
          role="button"
          tabindex="0"
          aria-label="Upload files. Click or drag and drop."
          @click=${this._handleClick}
          @keydown=${this._handleKeydown}
          @dragover=${this._handleDragOver}
          @dragleave=${this._handleDragLeave}
          @drop=${this._handleDrop}
        >
          <span class="upload-icon" aria-hidden="true">\u2191</span>
          <span class="upload-text">
            Drag & drop files here or <span class="browse-link">browse</span>
          </span>
          ${this.accept ? html`
            <span class="upload-hint">Accepted: ${this.accept}</span>
          ` : ''}
          ${this.maxSize > 0 ? html`
            <span class="upload-hint">Max size: ${this._formatSize(this.maxSize)}</span>
          ` : ''}
        </div>

        <input
          type="file"
          accept=${this.accept || undefined}
          ?multiple=${this.multiple}
          @change=${this._handleInputChange}
          aria-hidden="true"
          tabindex="-1"
        />

        ${this._error ? html`
          <div class="error-message" role="alert" part="error">${this._error}</div>
        ` : ''}

        ${this._files.length > 0 ? html`
          <div class="file-list" part="file-list" role="list" aria-label="Selected files">
            ${this._files.map((file, i) => html`
              <div class="file-item" part="file-item" role="listitem">
                <span class="file-icon" aria-hidden="true">\u{1F4CE}</span>
                <span class="file-name">${file.name}</span>
                <span class="file-size">${this._formatSize(file.size)}</span>
                <button
                  class="file-remove"
                  @click=${(e) => { e.stopPropagation(); this._removeFile(i); }}
                  aria-label="Remove ${file.name}"
                >&times;</button>
              </div>
            `)}
          </div>
        ` : ''}
      </div>
    `;
  }
}

customElements.define('arc-file-upload', ArcFileUpload);
