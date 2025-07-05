"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Trash, Edit, Plus, Save, X } from 'lucide-react';
import Image from 'next/image';
import { isAdmin } from '@/lib/admin';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { sdk } from '@farcaster/miniapp-sdk';

interface MemeTemplate {
  id: string;
  template_id: string;
  created_at: string;
  image_url: string;
  text_boxes: any[];
}

interface CreateTemplateForm {
  name: string;
  image_url: string;
  description: string;
}

export default function AdminPage() {
  const [templates, setTemplates] = useState<MemeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<CreateTemplateForm>({
    name: '',
    image_url: '',
    description: ''
  });
  const [editForm, setEditForm] = useState<Partial<MemeTemplate>>({});
  const { toast } = useToast();
  const { context } = useMiniKit();
  const userFid = context?.user.fid;

  // Initialize and authenticate
  useEffect(() => {
    async function init() {
      try {
        if (!userFid) {
          toast({ title: 'Error', description: 'User not found', variant: 'destructive' });
          setLoading(false);
          return;
        }

        // Check if user is admin
        if (!isAdmin(userFid)) {
          toast({ title: 'Access Denied', description: 'Admin privileges required', variant: 'destructive' });
          setLoading(false);
          return;
        }

        // User is authorized as admin
        setIsAuthorized(true);

        // Load templates
        await loadTemplates();
      } catch (error) {
        console.error('Initialization error:', error);
        toast({ title: 'Error', description: 'Failed to initialize admin panel', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    }

    if (userFid !== undefined) {
      init();
    }
  }, [userFid, toast]);

  const loadTemplates = async () => {
    try {
      // Use SDK's authenticated fetch which automatically handles the token
      const response = await sdk.quickAuth.fetch('/api/admin/templates');

      if (!response.ok) {
        throw new Error('Failed to load templates');
      }

      const data = await response.json();
      setTemplates(data.templates);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({ title: 'Error', description: 'Failed to load templates', variant: 'destructive' });
    }
  };

  const handleCreateTemplate = async () => {
    try {
      // Use SDK's authenticated fetch which automatically handles the token
      const response = await sdk.quickAuth.fetch('/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const data = await response.json();
      setTemplates([data.template, ...templates]);
      setCreateForm({ name: '', image_url: '', description: '' });
      setShowCreateForm(false);
      toast({ title: 'Success', description: 'Template created successfully' });
    } catch (error) {
      console.error('Error creating template:', error);
      toast({ title: 'Error', description: 'Failed to create template', variant: 'destructive' });
    }
  };

  const handleUpdateTemplate = async (id: string) => {
    try {
      // Use SDK's authenticated fetch which automatically handles the token
      const response = await sdk.quickAuth.fetch(`/api/admin/templates/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Failed to update template');
      }

      const data = await response.json();
      setTemplates(templates.map(t => t.id === id ? data.template : t));
      setEditingTemplate(null);
      setEditForm({});
      toast({ title: 'Success', description: 'Template updated successfully' });
    } catch (error) {
      console.error('Error updating template:', error);
      toast({ title: 'Error', description: 'Failed to update template', variant: 'destructive' });
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      // Use SDK's authenticated fetch which automatically handles the token
      const response = await sdk.quickAuth.fetch(`/api/admin/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      setTemplates(templates.filter(t => t.id !== id));
      toast({ title: 'Success', description: 'Template deleted successfully' });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({ title: 'Error', description: 'Failed to delete template', variant: 'destructive' });
    }
  };

  const startEditing = (template: MemeTemplate) => {
    setEditingTemplate(template.id);
    setEditForm({
      template_id: template.template_id,
      image_url: template.image_url,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="p-8 bg-black/20 border-white/20 backdrop-blur-md">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p>Admin privileges required to access this page.</p>
            {userFid && <p className="mt-2 text-sm opacity-70">Your FID: {userFid}</p>}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Panel - Template Management</h1>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Template
          </Button>
        </div>

        {/* Create Template Form */}
        {showCreateForm && (
          <Card className="p-6 mb-8 bg-black/20 border-white/20 backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Create New Template</h2>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="ghost"
                size="icon"
                className="text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white mb-2">Template Name</label>
                <Input
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="Enter template name"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div>
                <label className="block text-white mb-2">Image URL</label>
                <Input
                  value={createForm.image_url}
                  onChange={(e) => setCreateForm({ ...createForm, image_url: e.target.value })}
                  placeholder="Enter image URL"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-white mb-2">Description</label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Enter description (optional)"
                  className="bg-white/10 border-white/20 text-white"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleCreateTemplate}
                disabled={!createForm.name || !createForm.image_url}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Create Template
              </Button>
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id} className="bg-black/20 border-white/20 backdrop-blur-md overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  src={template.image_url}
                  alt={template.template_id}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                {editingTemplate === template.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editForm.template_id || ''}
                      onChange={(e) => setEditForm({ ...editForm, template_id: e.target.value })}
                      placeholder="Template name"
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <Input
                      value={editForm.image_url || ''}
                      onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                      placeholder="Image URL"
                      className="bg-white/10 border-white/20 text-white"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateTemplate(template.id)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-3 h-3 mr-1" />
                        Save
                      </Button>
                      <Button
                        onClick={() => {
                          setEditingTemplate(null);
                          setEditForm({});
                        }}
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-white font-semibold mb-2">{template.template_id}</h3>
                    <p className="text-white/70 text-sm mb-3">
                      Created: {new Date(template.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-white/70 text-sm mb-3">
                      Text boxes: {template.text_boxes?.length || 0}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEditing(template)}
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDeleteTemplate(template.id)}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {templates.length === 0 && (
          <div className="text-center text-white/70 py-12">
            <p className="text-xl">No templates found</p>
            <p className="mt-2">Create your first template to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}