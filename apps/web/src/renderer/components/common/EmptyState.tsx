import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title?: string;
  message: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Empty state component for when no data is available
 */
export function EmptyState({
  title = 'Nenhum resultado encontrado',
  message,
  icon = '📭',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>{icon}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {actionLabel && onAction && (
        <button onClick={onAction} className={styles.actionButton}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
