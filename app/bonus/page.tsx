'use client';

import { Box, Container, Typography, AppBar, Toolbar, Chip } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';

/**
 * Bonus jQuery task page
 * Demonstrates jQuery proficiency with dynamic list management
 */
export default function BonusPage() {
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  useEffect(() => {
    // Store setConfirmClearAll in window for jQuery access
    (window as any).showClearConfirm = () => setConfirmClearAll(true);

    // Dynamically load jQuery
    const loadjQuery = () => {
      return new Promise<void>((resolve) => {
        if (window.jQuery && window.$) {
          resolve();
          return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://code.jquery.com/jquery-3.7.1.min.js';
        script.onload = () => resolve();
        document.head.appendChild(script);
      });
    };

    // Initialize jQuery functionality after loading
    loadjQuery().then(() => {
      const $ = window.$;

      // Add item to list
      $('#add-item-btn').on('click', function (this: any) {
        const inputValue = $('#item-input').val() as string;

        // Clear any existing error messages
        $('#error-message').fadeOut(200, function (this: any) {
          $(this).remove();
        });

        // Validate input
        if (!inputValue || inputValue.trim() === '') {
          // Show error message
          const errorMsg = $('<div>')
            .attr('id', 'error-message')
            .addClass('error-message')
            .text('⚠️ Please enter a valid item')
            .hide()
            .insertAfter('#item-input');

          errorMsg.fadeIn(300);

          // Auto-hide error after 2 seconds
          setTimeout(() => {
            errorMsg.fadeOut(300, function (this: any) {
              $(this).remove();
            });
          }, 2000);

          return;
        }

        // Create new list item with fade-in animation
        const listItem = $('<li>')
          .addClass('list-item')
          .html(`
            <span class="item-text">${inputValue.trim()}</span>
            <button class="delete-btn">Delete</button>
          `)
          .hide();

        $('#items-list').append(listItem);
        listItem.fadeIn(300);

        // Clear input
        $('#item-input').val('');

        // Update counter
        updateCounter();
      });

      // Handle Enter key press
      $('#item-input').on('keypress', function (e: any) {
        if (e.which === 13) {
          $('#add-item-btn').trigger('click');
        }
      });

      // Delete item with fade-out animation (using event delegation)
      $('#items-list').on('click', '.delete-btn', function (this: any) {
        const listItem = $(this).closest('li');
        
        listItem.fadeOut(300, function (this: any) {
          $(this).remove();
          updateCounter();
        });
      });

      // Update item counter
      function updateCounter() {
        const count = $('#items-list li').length;
        $('#item-counter').text(count);
      }

      // Clear all items - trigger modal
      $('#clear-all-btn').on('click', function () {
        const items = $('#items-list li');
        
        if (items.length === 0) {
          return;
        }

        // Trigger React state to show modal via window function
        if ((window as any).showClearConfirm) {
          (window as any).showClearConfirm();
        }
      });

      // Store clearAllItems function globally for modal callback
      (window as any).clearAllItems = () => {
        const items = $('#items-list li');
        items.each(function (index: number, el: any) {
          const item = $(el as any);
          setTimeout(() => {
            item.fadeOut(200, function (this: any) {
              $(this).remove();
              updateCounter();
            });
          }, index * 50);
        });
      };

      // Cleanup event listeners on unmount
      return () => {
        if (window.$ && window.$) {
          $('#add-item-btn').off('click');
          $('#item-input').off('keypress');
          $('#items-list').off('click', '.delete-btn');
          $('#clear-all-btn').off('click');
        }
        // Clean up window functions
        delete (window as any).showClearConfirm;
        delete (window as any).clearAllItems;
      };
    });
  }, [setConfirmClearAll]);

  return (
    <>
      {/* Top Navigation Bar */}
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'background.paper', color: 'text.primary' }}>
        <Toolbar>
          <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
            <Chip icon={<BackIcon />} label="Back to Kanban" clickable />
          </Link>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1, ml: 2, fontWeight: 600 }}>
            jQuery Bonus Task
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="md" sx={{ mt: 6, mb: 4 }}>
        <Box mb={4}>
          <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
            Dynamic List Manager
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={1}>
            Built with vanilla jQuery - Add, remove, and manage items with smooth animations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Item Count: <span id="item-counter" style={{ fontWeight: 600, color: '#2563EB' }}>0</span>
          </Typography>
        </Box>

        {/* jQuery Dynamic List */}
        <Box
          sx={{
            backgroundColor: 'white',
            borderRadius: 2,
            p: 4,
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
          }}
        >
          <Box className="input-container" sx={{ mb: 3 }}>
            <input
              type="text"
              id="item-input"
              placeholder="Enter an item..."
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '16px',
                border: '2px solid #E5E7EB',
                borderRadius: '8px',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit',
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <button
                id="add-item-btn"
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'white',
                  backgroundColor: '#2563EB',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
              >
                Add Item
              </button>
              
              <button
                id="clear-all-btn"
                style={{
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#DC2626',
                  backgroundColor: 'white',
                  border: '2px solid #DC2626',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = '#DC2626';
                }}
              >
                Clear All
              </button>
            </Box>
          </Box>

          <ul
            id="items-list"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}
          />
        </Box>
      </Container>

      {/* Inline styles for jQuery elements */}
      <style jsx global>{`
        .list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          margin-bottom: 12px;
          background-color: #F9FAFB;
          border: 2px solid #E5E7EB;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .list-item:hover {
          background-color: #F3F4F6;
          border-color: #D1D5DB;
          transform: translateX(4px);
        }

        .item-text {
          font-size: 16px;
          color: #1F2937;
          font-weight: 500;
        }

        .delete-btn {
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          color: white;
          background-color: #EF4444;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .delete-btn:hover {
          background-color: #DC2626;
        }

        .error-message {
          color: #DC2626;
          font-size: 14px;
          font-weight: 500;
          margin-top: 8px;
          padding: 8px 12px;
          background-color: #FEE2E2;
          border-radius: 6px;
          border: 1px solid #FECACA;
        }

        #item-input:focus {
          border-color: #2563EB !important;
        }
      `}</style>

      {/* Clear All Confirmation Modal */}
      <ConfirmDialog
        open={confirmClearAll}
        title="Clear All Items"
        message="Are you sure you want to clear all items from the list? This action cannot be undone."
        onConfirm={() => {
          if (typeof window !== 'undefined' && (window as any).clearAllItems) {
            (window as any).clearAllItems();
          }
          setConfirmClearAll(false);
        }}
        onCancel={() => setConfirmClearAll(false)}
        confirmText="Clear All"
        cancelText="Cancel"
        severity="warning"
      />
    </>
  );
}

// Extend Window interface for jQuery
declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

