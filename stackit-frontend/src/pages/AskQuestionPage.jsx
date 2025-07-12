import React, { useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const AskQuestionPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const quillRef = useRef(null); // Ref to access Quill editor instance

  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Custom Image Handler
  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
          const { data } = await axios.post('/api/upload', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${user.token}`,
            },
          });

          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          // The backend returns a path like '/uploads/image-162987...'. Prepend the base URL.
          const imageUrl = `${axios.defaults.baseURL}${data.imagePath}`;
          quill.insertEmbed(range.index, 'image', imageUrl);
        } catch (err) {
          console.error('Image upload failed:', err);
          setError('Image upload failed. Please try again.');
        }
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image'], // Added 'image' button
        [{ 'align': [] }],
        ['clean'],
      ],
      handlers: {
        image: imageHandler, // Register the custom handler
      },
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link', 'image', 'align',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await axios.post(
        '/api/questions',
        {
          title,
          description,
          tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      navigate(`/questions/${data._id}`);
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || 'Failed to submit question.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Ask a Public Question</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        {error && <p className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</p>}
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Description
          </label>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={description}
            onChange={setDescription}
            modules={modules}
            formats={formats}
            className="bg-white"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">
            Tags
          </label>
          <input
            id="tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Post Your Question'}
        </button>
      </form>
    </div>
  );
};

export default AskQuestionPage;
