import BookForm from "../components/BookForm";
import { addBook } from "../lib/db";

export default function LogBook() {
  const handleSubmit = async (book) => {
    await addBook(book);
    alert(`Book logged: ${book.title} by ${book.author}`);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Log a Book</h1>
      <BookForm onSubmit={handleSubmit} />
    </div>
  );
}
