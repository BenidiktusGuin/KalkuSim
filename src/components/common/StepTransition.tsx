/**
 * ============================================================================
 * Komponen    : StepTransition
 * Lapisan     : Komponen Bersama (Transisi Antar-Langkah)
 *
 * Deskripsi:
 * Wrapper presentasi untuk animasi masuk antar layar. Komponen ini tidak
 * menyimpan state dan tidak memengaruhi isi layar.
 * ============================================================================
 */

import React from 'react';

export type StepDirection = 'forward' | 'backward';

interface StepTransitionProps {
  direction: StepDirection;
  children: React.ReactNode;
}

/**
 * Membungkus konten langkah dengan animasi masuk yang singkat.
 *
 * Gunakan `key={currentStep}` pada pemanggilan agar React me-remount wrapper
 * setiap kali langkah berubah dan animasi dimulai kembali.
 */
export const StepTransition: React.FC<StepTransitionProps> = ({
  direction,
  children,
}) => (
  <div className={`step-transition step-transition--${direction}`}>
    {children}
  </div>
);

export default StepTransition;
