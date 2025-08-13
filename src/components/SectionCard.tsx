import React from "react";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({
  title,
  children,
  className = "",
}: SectionCardProps) {
  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{title}</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
}
