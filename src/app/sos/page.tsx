'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, Shield, AlertTriangle, Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  isDefault?: boolean;
}

export default function SOSPage() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [newContact, setNewContact] = useState({ name: '', number: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize with default police number
  useEffect(() => {
    const savedContacts = localStorage.getItem('emergency-contacts');
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    } else {
      // Set default police number
      const defaultContacts: EmergencyContact[] = [
        { id: 'police', name: 'Police', number: '100', isDefault: true }
      ];
      setContacts(defaultContacts);
      localStorage.setItem('emergency-contacts', JSON.stringify(defaultContacts));
    }
  }, []);

  // Save contacts to localStorage whenever contacts change
  useEffect(() => {
    if (contacts.length > 0) {
      localStorage.setItem('emergency-contacts', JSON.stringify(contacts));
    }
  }, [contacts]);

  const validateIndianMobileNumber = (number: string): boolean => {
    // Indian mobile number validation: 10 digits starting with 6, 7, 8, or 9
    const cleanedNumber = number.replace(/\D/g, '');
    return /^[6-9]\d{9}$/.test(cleanedNumber);
  };

  const formatIndianMobileNumber = (number: string): string => {
    const cleaned = number.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }
    return cleaned;
  };

  const handleAddContact = () => {
    if (!newContact.name.trim() || !newContact.number.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both name and number fields.",
        variant: "destructive"
      });
      return;
    }

    const cleanedNumber = newContact.number.replace(/\D/g, '');
    if (!validateIndianMobileNumber(cleanedNumber)) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
        variant: "destructive"
      });
      return;
    }

    if (contacts.length >= 3) {
      toast({
        title: "Limit Reached",
        description: "You can only have 3 emergency contacts. Please delete one first.",
        variant: "destructive"
      });
      return;
    }

    const formattedNumber = formatIndianMobileNumber(cleanedNumber);
    const newContactData: EmergencyContact = {
      id: Date.now().toString(),
      name: newContact.name.trim(),
      number: formattedNumber,
      isDefault: false
    };

    setContacts(prev => [...prev, newContactData]);
    setNewContact({ name: '', number: '' });
    
    toast({
      title: "Contact Added",
      description: `${newContact.name} has been added to your emergency contacts.`
    });
  };

  const handleDeleteContact = (id: string) => {
    const contact = contacts.find(c => c.id === id);
    if (contact?.isDefault) {
      toast({
        title: "Cannot Delete",
        description: "Default police number cannot be deleted.",
        variant: "destructive"
      });
      return;
    }

    setContacts(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Contact Deleted",
      description: "Emergency contact has been removed."
    });
  };

  const handleCall = (number: string, name: string) => {
    try {
      window.location.href = `tel:${number}`;
    } catch (error) {
      console.error('Error initiating call:', error);
      // Fallback: copy number to clipboard
      navigator.clipboard.writeText(number).then(() => {
        toast({
          title: "Number Copied",
          description: `${name}'s number has been copied to clipboard: ${number}`
        });
      });
    }
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    const contact = contacts.find(c => c.id === id);
    if (contact) {
      setNewContact({ name: contact.name, number: contact.number.replace('+91', '') });
    }
  };

  const handleUpdateContact = () => {
    if (!newContact.name.trim() || !newContact.number.trim()) {
      toast({
        title: "Error",
        description: "Please fill in both name and number fields.",
        variant: "destructive"
      });
      return;
    }

    const cleanedNumber = newContact.number.replace(/\D/g, '');
    if (!validateIndianMobileNumber(cleanedNumber)) {
      toast({
        title: "Invalid Number",
        description: "Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
        variant: "destructive"
      });
      return;
    }

    const formattedNumber = formatIndianMobileNumber(cleanedNumber);
    setContacts(prev => prev.map(c => 
      c.id === editingId 
        ? { ...c, name: newContact.name.trim(), number: formattedNumber }
        : c
    ));
    
    setEditingId(null);
    setNewContact({ name: '', number: '' });
    
    toast({
      title: "Contact Updated",
      description: "Emergency contact has been updated."
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewContact({ name: '', number: '' });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-red-600 flex items-center justify-center gap-2">
            <Shield className="h-8 w-8" />
            Emergency SOS
          </h1>
          <p className="text-muted-foreground">
            Manage your emergency contacts for quick access during emergencies
          </p>
        </div>

        {/* Alert */}
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Important:</strong> You can add up to 3 emergency contacts. The police number (100) is included by default and cannot be removed.
          </AlertDescription>
        </Alert>

        {/* Emergency Contacts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Emergency Contacts ({contacts.length}/3)
            </CardTitle>
            <CardDescription>
              Tap any contact to call immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    contact.isDefault ? 'bg-red-600' : 'bg-blue-600'
                  } text-white font-bold`}>
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{contact.name}</p>
                    <p className="text-sm text-muted-foreground">{contact.number}</p>
                    {contact.isDefault && (
                      <span className="text-xs text-red-600 font-medium">Default</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleCall(contact.number, contact.name)}
                    className="bg-red-600 hover:bg-red-700"
                    size="sm"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                  {!contact.isDefault && (
                    <Button
                      onClick={() => handleEdit(contact.id)}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                  )}
                  {!contact.isDefault && (
                    <Button
                      onClick={() => handleDeleteContact(contact.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Contact Form */}
            {contacts.length < 3 && !editingId && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Add New Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact-name">Name</Label>
                    <Input
                      id="contact-name"
                      placeholder="Enter contact name"
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact-number">Mobile Number</Label>
                    <Input
                      id="contact-number"
                      placeholder="Enter 10-digit mobile number"
                      value={newContact.number}
                      onChange={(e) => setNewContact(prev => ({ ...prev, number: e.target.value }))}
                      maxLength={10}
                    />
                  </div>
                </div>
                <Button onClick={handleAddContact} className="mt-4">
                  <Save className="h-4 w-4 mr-2" />
                  Add Contact
                </Button>
              </div>
            )}

            {/* Edit Contact Form */}
            {editingId && (
              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Edit Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-contact-name">Name</Label>
                    <Input
                      id="edit-contact-name"
                      placeholder="Enter contact name"
                      value={newContact.name}
                      onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-contact-number">Mobile Number</Label>
                    <Input
                      id="edit-contact-number"
                      placeholder="Enter 10-digit mobile number"
                      value={newContact.number}
                      onChange={(e) => setNewContact(prev => ({ ...prev, number: e.target.value }))}
                      maxLength={10}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleUpdateContact}>
                    <Save className="h-4 w-4 mr-2" />
                    Update Contact
                  </Button>
                  <Button onClick={cancelEdit} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Emergency services available 24/7
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => handleCall('100', 'Police')}
                className="bg-red-600 hover:bg-red-700 h-16"
              >
                <div className="text-center">
                  <Shield className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">Police</div>
                  <div className="text-xs">100</div>
                </div>
              </Button>
              <Button
                onClick={() => handleCall('102', 'Ambulance')}
                className="bg-red-500 hover:bg-red-600 h-16"
              >
                <div className="text-center">
                  <Phone className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">Ambulance</div>
                  <div className="text-xs">102</div>
                </div>
              </Button>
              <Button
                onClick={() => handleCall('101', 'Fire')}
                className="bg-orange-600 hover:bg-orange-700 h-16"
              >
                <div className="text-center">
                  <AlertTriangle className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">Fire</div>
                  <div className="text-xs">101</div>
                </div>
              </Button>
              <Button
                onClick={() => handleCall('181', 'Women Helpline')}
                className="bg-pink-600 hover:bg-pink-700 h-16"
              >
                <div className="text-center">
                  <Phone className="h-6 w-6 mx-auto mb-1" />
                  <div className="text-sm font-medium">Women</div>
                  <div className="text-xs">181</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
