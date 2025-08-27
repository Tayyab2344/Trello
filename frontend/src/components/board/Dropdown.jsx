import { useState, useRef, useEffect } from "react";

const DropdownMenu = ({ onAdd, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="p-1 rounded hover:bg-gray-200"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 bg-white rounded shadow border z-10">
          {onAdd && (
            <button
              onClick={() => {
                onAdd();
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
            >
              ➕ Add card
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                onDelete();
                setOpen(false);
              }}
              className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              🗑 Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
