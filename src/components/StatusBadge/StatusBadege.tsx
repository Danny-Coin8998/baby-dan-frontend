// "use client";

// import React from "react";

// export type StatusType =
//   | "ACTIVE"
//   | "COMPLETED"
//   | "SUCCESS"
//   | "PENDING"
//   | "PROCESSING"
//   | "CANCELLED"
//   | "FAILED"
//   | "ERROR"
//   | "EXPIRED"
//   | "INACTIVE"
//   | string;

// export interface StatusBadgeProps {
//   status: StatusType;
//   className?: string;
// }

// const StatusBadge: React.FC<StatusBadgeProps> = ({
//   status,
//   className = "",
// }) => {
//   const getStatusStyle = (status: StatusType): string => {
//     const statusUpper = status?.toUpperCase();

//     switch (statusUpper) {
//       case "ACTIVE":
//         return "text-green-400";
//       case "COMPLETED":
//       case "SUCCESS":
//         return "text-blue-400";
//       case "PENDING":
//       case "PROCESSING":
//         return "text-yellow-400";
//       case "CANCELLED":
//       case "FAILED":
//       case "ERROR":
//         return "text-red-400";
//       case "EXPIRED":
//       case "INACTIVE":
//         return "text-gray-400";
//       default:
//         return "text-gray-400";
//     }
//   };

//   return (
//     <span
//       className={`
//         inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
//         border transition-colors duration-200
//         ${getStatusStyle(status)}
//         ${className}
//       `}
//     >
//       {status}
//     </span>
//   );
// };

// export default StatusBadge;
