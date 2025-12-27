import { useState } from 'react';
import { UserPlus, Edit2, Trash2, Star, X, Check, Eye, EyeOff } from 'lucide-react';

interface ContactPerson {
  name: string;
  surname: string;
  email: string;
  phone: string;
  mobile_phone: string;
  password: string;
  is_primary: boolean;
}

interface GarageContactManagementProps {
  contacts: ContactPerson[];
  onUpdate: (contacts: ContactPerson[]) => void;
}

export default function GarageContactManagement({ contacts, onUpdate }: GarageContactManagementProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<number, boolean>>({});
  const [newContact, setNewContact] = useState<ContactPerson>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    mobile_phone: '',
    password: '',
    is_primary: false
  });
  const [editContact, setEditContact] = useState<ContactPerson | null>(null);

  const handleAddContact = () => {
    if (!newContact.name || !newContact.surname || !newContact.email || !newContact.password) {
      alert('Please fill in name, surname, email, and password');
      return;
    }

    const emailExists = contacts.some(c => c.email.toLowerCase() === newContact.email.toLowerCase());
    if (emailExists) {
      alert('A contact with this email already exists');
      return;
    }

    onUpdate([...contacts, newContact]);
    setNewContact({ name: '', surname: '', email: '', phone: '', mobile_phone: '', password: '', is_primary: false });
    setAddingNew(false);
  };

  const handleUpdateContact = (index: number) => {
    if (!editContact) return;

    if (!editContact.name || !editContact.surname || !editContact.email || !editContact.password) {
      alert('Please fill in name, surname, email, and password');
      return;
    }

    const emailExists = contacts.some((c, i) =>
      i !== index && c.email.toLowerCase() === editContact.email.toLowerCase()
    );
    if (emailExists) {
      alert('A contact with this email already exists');
      return;
    }

    const updatedContacts = [...contacts];
    updatedContacts[index] = editContact;
    onUpdate(updatedContacts);
    setEditingIndex(null);
    setEditContact(null);
  };

  const handleDeleteContact = (index: number) => {
    if (contacts.length === 1) {
      alert('Cannot delete the last contact person. At least one contact is required.');
      return;
    }

    if (confirm('Are you sure you want to remove this contact person?')) {
      const updatedContacts = contacts.filter((_, i) => i !== index);

      if (contacts[index].is_primary && updatedContacts.length > 0) {
        updatedContacts[0].is_primary = true;
      }

      onUpdate(updatedContacts);
    }
  };

  const handleSetPrimary = (index: number) => {
    const updatedContacts = contacts.map((contact, i) => ({
      ...contact,
      is_primary: i === index
    }));
    onUpdate(updatedContacts);
  };

  const togglePasswordVisibility = (index: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const startEdit = (index: number) => {
    setEditContact({ ...contacts[index] });
    setEditingIndex(index);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditContact(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Contact Persons</h2>
        <button
          type="button"
          onClick={() => setAddingNew(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Contact
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Manage contact persons who can login and update garage information. At least one contact is required.
      </p>

      {addingNew && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Contact Person</h3>
              <button
                type="button"
                onClick={() => {
                  setAddingNew(false);
                  setNewContact({ name: '', surname: '', email: '', phone: '', mobile_phone: '', password: '', is_primary: false });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                  <input
                    type="text"
                    value={newContact.surname}
                    onChange={(e) => setNewContact({ ...newContact, surname: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  value={newContact.mobile_phone}
                  onChange={(e) => setNewContact({ ...newContact, mobile_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0821234567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Office Number</label>
                <input
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0123456789 (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input
                  type="text"
                  value={newContact.password}
                  onChange={(e) => setNewContact({ ...newContact, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center gap-3">
              <button
                type="button"
                onClick={handleAddContact}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Add Contact
              </button>
              <button
                type="button"
                onClick={() => {
                  setAddingNew(false);
                  setNewContact({ name: '', surname: '', email: '', phone: '', mobile_phone: '', password: '', is_primary: false });
                }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {contacts.map((contact, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            {editingIndex === index && editContact ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={editContact.name}
                      onChange={(e) => setEditContact({ ...editContact, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Surname *</label>
                    <input
                      type="text"
                      value={editContact.surname}
                      onChange={(e) => setEditContact({ ...editContact, surname: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editContact.email}
                    onChange={(e) => setEditContact({ ...editContact, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={editContact.mobile_phone}
                    onChange={(e) => setEditContact({ ...editContact, mobile_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0821234567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Office Number</label>
                  <input
                    type="tel"
                    value={editContact.phone}
                    onChange={(e) => setEditContact({ ...editContact, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0123456789 (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="text"
                    value={editContact.password}
                    onChange={(e) => setEditContact({ ...editContact, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateContact(index)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{contact.name} {contact.surname}</h3>
                      {contact.is_primary && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          <Star className="w-3 h-3" />
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{contact.email}</p>
                    {contact.mobile_phone && (
                      <p className="text-sm text-gray-600">Mobile: {contact.mobile_phone}</p>
                    )}
                    {contact.phone && (
                      <p className="text-sm text-gray-600">Office: {contact.phone}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-gray-500">
                        Password: {showPasswords[index] ? contact.password : '••••••••'}
                      </p>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(index)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[index] ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!contact.is_primary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className="p-2 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                        title="Set as primary contact"
                      >
                        <Star className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => startEdit(index)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Edit contact"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(index)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove contact"
                      disabled={contacts.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-blue-900 text-sm font-medium mb-2">Contact Management Guidelines:</p>
        <ul className="text-blue-800 text-sm space-y-1 list-disc list-inside">
          <li>All contacts can login using their email and password</li>
          <li>The primary contact is displayed in garage directories</li>
          <li>At least one contact person is required</li>
          <li>Each email must be unique</li>
          <li>Click "Save Changes" at the bottom after making any updates</li>
        </ul>
      </div>
    </div>
  );
}
