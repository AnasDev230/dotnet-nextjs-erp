"use client";

export function usePrint() {
  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 100);
  };

  return { handlePrint };
}
