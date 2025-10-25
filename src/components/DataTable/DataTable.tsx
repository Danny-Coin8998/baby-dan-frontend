// "use client";

// import React, { useState } from "react";
// import { ChevronRight, LucideIcon } from "lucide-react";

// export interface Column<T = any> {
//   header: string;
//   key: keyof T | string;
//   align?: "left" | "center" | "right";
//   className?: string;
//   cellClassName?: string;
//   render?: (row: T, index: number) => React.ReactNode;
// }

// export interface DataTableProps<T = any> {
//   title?: string;
//   icon?: LucideIcon;
//   data?: T[];
//   columns?: Column<T>[];
//   itemsPerPage?: number;
//   showHeader?: boolean;
//   showPagination?: boolean;
//   className?: string;
//   onRowClick?: (row: T) => void;
// }

// const DataTable = <T extends Record<string, any>>({
//   title,
//   icon: IconComponent,
//   data = [],
//   columns = [],
//   itemsPerPage = 10,
//   showHeader = true,
//   showPagination = true,
//   className = "",
//   onRowClick,
// }: DataTableProps<T>) => {
//   const [currentPage, setCurrentPage] = useState<number>(1);

//   const totalPages = Math.ceil(data.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentData = data.slice(startIndex, endIndex);

//   const getPageNumbers = (): number[] => {
//     const pages: number[] = [];
//     const maxVisible = 4;

//     if (totalPages <= maxVisible) {
//       for (let i = 1; i <= totalPages; i++) {
//         pages.push(i);
//       }
//     } else {
//       if (currentPage <= 2) {
//         pages.push(1, 2, 3, 4);
//       } else if (currentPage >= totalPages - 1) {
//         pages.push(totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
//       } else {
//         pages.push(
//           currentPage - 1,
//           currentPage,
//           currentPage + 1,
//           currentPage + 2
//         );
//       }
//     }

//     return pages;
//   };

//   const handlePageChange = (page: number): void => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//     }
//   };

//   const handleRowClick = (
//     row: T,
//     e: React.MouseEvent<HTMLTableRowElement>
//   ): void => {
//     const target = e.target as HTMLElement;
//     if (target.tagName === "BUTTON" || target.closest("button")) {
//       return;
//     }
//     onRowClick?.(row);
//   };

//   return (
//     <div className={`w-full space-y-4 ${className}`}>
//       {showHeader && title && (
//         <div className="space-y-2">
//           <div className="flex items-center gap-3">
//             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold ">
//               {title}
//             </h1>
//             {IconComponent && (
//               <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 " />
//             )}
//           </div>
//           <div className="h-px bg-gray-500" />
//         </div>
//       )}

//       <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-sm shadow-2xl overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead>
//               <tr className="border-b border-slate-600/50">
//                 {columns.map((column, index) => (
//                   <th
//                     key={index}
//                     className={`text-gray-300 font-semibold py-4 px-6 ${
//                       column.align === "center"
//                         ? "text-center"
//                         : column.align === "right"
//                         ? "text-right"
//                         : "text-left"
//                     } ${column.className || ""}`}
//                   >
//                     {column.header}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {currentData.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan={columns.length}
//                     className="text-center py-12 text-gray-400"
//                   >
//                     ไม่มีข้อมูล
//                   </td>
//                 </tr>
//               ) : (
//                 currentData.map((row, rowIndex) => (
//                   <tr
//                     key={(row as any).id || rowIndex}
//                     className="border-b border-slate-700/30 hover:bg-slate-700/20 cursor-pointer transition-colors"
//                     onClick={(e) => handleRowClick(row, e)}
//                   >
//                     {columns.map((column, colIndex) => (
//                       <td
//                         key={colIndex}
//                         className={` py-4 px-6 ${
//                           column.align === "center"
//                             ? "text-center"
//                             : column.align === "right"
//                             ? "text-right"
//                             : "text-left"
//                         } ${column.cellClassName || ""}`}
//                       >
//                         {column.render
//                           ? column.render(row, rowIndex)
//                           : (row[column.key as keyof T] as React.ReactNode) ||
//                             "-"}
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {showPagination && totalPages > 1 && (
//           <div className="flex flex-col items-center justify-center p-6 border-t border-slate-700/30 space-y-4">
//             <div className="flex items-center gap-2">
//               {getPageNumbers().map((page) => (
//                 <button
//                   key={page}
//                   onClick={() => handlePageChange(page)}
//                   className={`w-10 h-10 rounded-full text-sm font-medium transition-all duration-200 ${
//                     page === currentPage
//                       ? "bg-gradient-to-r from-purple-500 to-purple-600  shadow-lg transform scale-105"
//                       : "bg-gray-600/40 text-gray-300 hover:bg-gray-500/60 hover:"
//                   }`}
//                 >
//                   {page}
//                 </button>
//               ))}

//               {currentPage < totalPages && (
//                 <button
//                   onClick={() => handlePageChange(currentPage + 1)}
//                   className="w-10 h-10 rounded-full bg-gray-600/40 text-gray-300 hover:bg-gray-500/60 hover: transition-all duration-200 flex items-center justify-center ml-1"
//                 >
//                   <ChevronRight className="h-4 w-4" />
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DataTable;
