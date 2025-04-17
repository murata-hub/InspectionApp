// components/PaginationControls.jsx
import React from "react";

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-center mt-4 space-x-2">
            <button
                onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                前へ
            </button>

            <span className="px-3 py-1">
                {currentPage} / {totalPages}ページ
            </span>

            <button
                onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
                次へ
            </button>
        </div>
    );
};

export default PaginationControls;
