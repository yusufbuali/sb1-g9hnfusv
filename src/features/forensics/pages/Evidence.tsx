import React, { useState, useEffect } from 'react';
import { Upload, FileText, Image, AlertCircle, Plus, Beaker, TestTube, RotateCw, X, Trash2, Loader2, Save } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuthStore } from '../../../store/authStore';

interface Evidence {
  id: string;
  type: 'image' | 'report';
  filename: string;
  uploadedAt: string;
  url: string;
  notes?: string;
}

interface Test {
  id: string;
  name: string;
  description: string;
  repeats: number;
  status: 'pending' | 'in_progress' | 'completed';
  results?: string;
}

interface Specimen {
  id: string;
  name: string;
  description: string;
  collection_date: string;
  type: string;
  quantity: number;
  tests: Test[];
}

interface PreviewModalProps {
  imageUrl: string;
  filename: string;
  onClose: () => void;
}

interface DeleteConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ imageUrl, filename, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-secondary-200 flex items-center justify-between">
          <h3 className="text-lg font-display font-semibold text-secondary-900">{filename}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-secondary-500" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <img
            src={imageUrl}
            alt={filename}
            className="max-w-full h-auto mx-auto"
            style={{ maxHeight: 'calc(90vh - 8rem)' }}
          />
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-display font-semibold text-secondary-900 mb-2">
          {title}
        </h3>
        <p className="text-secondary-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-secondary-300 text-secondary-700 rounded-md hover:bg-secondary-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_REPORT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export default function Evidence() {
  const { caseId } = useParams();
  const { user } = useAuthStore();
  const [error, setError] = useState<string>('');
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [specimens, setSpecimens] = useState<Specimen[]>([]);
  const [showNewSpecimenModal, setShowNewSpecimenModal] = useState(false);
  const [showNewTestModal, setShowNewTestModal] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<Evidence | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    type: 'evidence' | 'specimen' | 'test';
    id: string;
    specimenId?: string;
    title: string;
    message: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingEvidence, setPendingEvidence] = useState<{
    file: File;
    type: 'image' | 'report';
    preview?: string;
    notes?: string;
  }[]>([]);
  const [newSpecimen, setNewSpecimen] = useState({
    name: '',
    description: '',
    type: '',
    quantity: 1,
    collection_date: new Date().toISOString().split('T')[0]
  });
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    repeats: 1,
    results: ''
  });

  useEffect(() => {
    if (caseId) {
      fetchEvidence();
      fetchSpecimens();
    }
  }, [caseId]);

  // Create object URLs for pending evidence previews
  useEffect(() => {
    pendingEvidence.forEach(item => {
      if (!item.preview && item.type === 'image') {
        const objectUrl = URL.createObjectURL(item.file);
        setPendingEvidence(prev => prev.map(p => 
          p === item ? { ...p, preview: objectUrl } : p
        ));
      }
    });

    // Cleanup object URLs on unmount
    return () => {
      pendingEvidence.forEach(item => {
        if (item.preview) {
          URL.revokeObjectURL(item.preview);
        }
      });
    };
  }, [pendingEvidence]);

  const fetchEvidence = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('evidence')
        .select('*')
        .eq('case_id', caseId);

      if (fetchError) throw fetchError;

      if (data) {
        const formattedEvidence: Evidence[] = data.map(item => ({
          id: item.id,
          type: item.file_type.startsWith('image/') ? 'image' : 'report',
          filename: item.file_name,
          uploadedAt: item.uploaded_at,
          url: item.file_url,
          notes: item.notes
        }));
        setEvidence(formattedEvidence);
      }
    } catch (err) {
      console.error('Error fetching evidence:', err);
      setError('Failed to load evidence');
    }
  };

  const fetchSpecimens = async () => {
    try {
      const { data: specimensData, error: specimensError } = await supabase
        .from('specimens')
        .select(`
          *,
          tests (*)
        `)
        .eq('case_id', caseId);

      if (specimensError) throw specimensError;

      if (specimensData) {
        const formattedSpecimens: Specimen[] = specimensData.map(specimen => ({
          id: specimen.id,
          name: specimen.name,
          description: specimen.description || '',
          collection_date: specimen.collection_date,
          type: specimen.type,
          quantity: specimen.quantity,
          tests: specimen.tests || []
        }));
        setSpecimens(formattedSpecimens);
      }
    } catch (err) {
      console.error('Error fetching specimens:', err);
      setError('Failed to load specimens');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'report') => {
    const files = event.target.files;
    if (!files) return;

    const allowedTypes = type === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_REPORT_TYPES;
    
    const validFiles = Array.from(files).filter(file => allowedTypes.includes(file.type));
    if (validFiles.length !== files.length) {
      setError(`Some files were skipped. Allowed types: ${type === 'image' ? 'JPG, PNG' : 'PDF, DOC, DOCX'}`);
    }

    setPendingEvidence(prev => [
      ...prev,
      ...validFiles.map(file => ({
        file,
        type,
        notes: ''
      }))
    ]);
    event.target.value = '';
  };

  const handleSaveEvidence = async () => {
    if (pendingEvidence.length === 0) return;
    setIsSaving(true);
    setError('');

    try {
      for (const item of pendingEvidence) {
        const fileExt = item.file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${caseId}/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(filePath, item.file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('evidence')
          .getPublicUrl(filePath);

        const { error: saveError } = await supabase
          .from('evidence')
          .insert({
            case_id: caseId,
            file_name: item.file.name,
            file_type: item.file.type,
            file_url: publicUrl,
            notes: item.notes,
            uploaded_by: user?.id
          });

        if (saveError) throw saveError;
      }

      // Clear pending evidence and refresh the list
      setPendingEvidence([]);
      fetchEvidence();
    } catch (err) {
      console.error('Error saving evidence:', err);
      setError('Failed to save evidence');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEvidence = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('evidence')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setEvidence(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting evidence:', err);
      setError('Failed to delete evidence');
    }
  };

  const handleRemovePendingEvidence = (index: number) => {
    setPendingEvidence(prev => {
      const item = prev[index];
      if (item.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleAddSpecimen = async () => {
    try {
      const { data, error: saveError } = await supabase
        .from('specimens')
        .insert({
          case_id: caseId,
          name: newSpecimen.name,
          description: newSpecimen.description,
          type: newSpecimen.type,
          quantity: newSpecimen.quantity,
          collection_date: newSpecimen.collection_date,
          collected_by: user?.id
        })
        .select()
        .single();

      if (saveError) throw saveError;

      if (data) {
        setSpecimens(prev => [...prev, {
          id: data.id,
          name: data.name,
          description: data.description || '',
          collection_date: data.collection_date,
          type: data.type,
          quantity: data.quantity,
          tests: []
        }]);
      }

      setShowNewSpecimenModal(false);
      setNewSpecimen({
        name: '',
        description: '',
        type: '',
        quantity: 1,
        collection_date: new Date().toISOString().split('T')[0]
      });
    } catch (err) {
      console.error('Error adding specimen:', err);
      setError('Failed to add specimen');
    }
  };

  const handleAddTest = async (specimenId: string) => {
    try {
      const { data, error: saveError } = await supabase
        .from('tests')
        .insert({
          specimen_id: specimenId,
          name: newTest.name,
          description: newTest.description,
          repeats: newTest.repeats,
          results: newTest.results,
          performed_by: user?.id,
          status: 'pending'
        })
        .select()
        .single();

      if (saveError) throw saveError;

      if (data) {
        setSpecimens(prev => prev.map(specimen => {
          if (specimen.id === specimenId) {
            return {
              ...specimen,
              tests: [...specimen.tests, data]
            };
          }
          return specimen;
        }));
      }

      setShowNewTestModal(null);
      setNewTest({
        name: '',
        description: '',
        repeats: 1,
        results: ''
      });
    } catch (err) {
      console.error('Error adding test:', err);
      setError('Failed to add test');
    }
  };

  const handleDeleteSpecimen = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('specimens')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      setSpecimens(prev => prev.filter(specimen => specimen.id !== id));
    } catch (err) {
      console.error('Error deleting specimen:', err);
      setError('Failed to delete specimen');
    }
  };

  const handleDeleteTest = async (specimenId: string, testId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('tests')
        .delete()
        .eq('id', testId);

      if (deleteError) throw deleteError;

      setSpecimens(prev => prev.map(specimen => {
        if (specimen.id === specimenId) {
          return {
            ...specimen,
            tests: specimen.tests.filter(test => test.id !== testId)
          };
        }
        return specimen;
      }));
    } catch (err) {
      console.error('Error deleting test:', err);
      setError('Failed to delete test');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex items-center gap-2 text-primary-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="font-medium">Loading evidence...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-secondary-900">Case Evidence #{caseId}</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* File Upload Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-display font-semibold text-secondary-800">Images</h2>
          </div>
          
          <div className="border-2 border-dashed border-secondary-200 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              id="image-upload"
              multiple
              accept=".jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'image')}
            />
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="w-12 h-12 text-secondary-400 mb-2" />
              <span className="text-sm font-medium text-secondary-600">Upload Images (JPG, PNG)</span>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-display font-semibold text-secondary-800">Reports</h2>
          </div>
          
          <div className="border-2 border-dashed border-secondary-200 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
            <input
              type="file"
              id="report-upload"
              multiple
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => handleFileSelect(e, 'report')}
            />
            <label
              htmlFor="report-upload"
              className="flex flex-col items-center cursor-pointer"
            >
              <Upload className="w-12 h-12 text-secondary-400 mb-2" />
              <span className="text-sm font-medium text-secondary-600">Upload Reports (PDF, DOC, DOCX)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Pending Evidence Preview */}
      {pendingEvidence.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">
            Pending Uploads
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingEvidence.map((item, index) => (
              <div
                key={index}
                className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 transition-colors group"
              >
                {item.type === 'image' && item.preview ? (
                  <div className="space-y-3">
                    <div className="relative">
                      <div className="aspect-video bg-secondary-100 rounded-md overflow-hidden">
                        <img 
                          src={item.preview}
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => handleRemovePendingEvidence(index)}
                        className="absolute top-2 right-2 p-1.5 bg-white bg-opacity-90 rounded-full shadow-sm hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-primary-500" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-secondary-900 truncate">
                        {item.file.name}
                      </p>
                      <p className="text-xs text-secondary-500">
                        {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemovePendingEvidence(index)}
                      className="p-1.5 rounded-full hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSaveEvidence}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save {pendingEvidence.length} {pendingEvidence.length === 1 ? 'File' : 'Files'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Evidence List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-display font-semibold text-secondary-800 mb-4">Uploaded Evidence</h2>
          
          {/* Images Section */}
          <div className="mb-8">
            <h3 className="text-lg font-display font-semibold text-secondary-800 mb-4">Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evidence
                .filter(item => item.type === 'image')
                .map((item) => (
                  <div
                    key={item.id}
                    className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 transition-colors group"
                  >
                    <div className="space-y-3">
                      <div className="relative">
                        <div 
                          className="aspect-video bg-secondary-100 rounded-md overflow-hidden cursor-pointer"
                          onClick={() => setPreviewImage(item)}
                        >
                          <img 
                            src={item.url} 
                            alt={item.filename}
                            className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                          />
                        </div>
                        <button
                          onClick={() => handleDeleteEvidence(item.id)}
                          className="absolute top-2 right-2 p-1.5 bg-white bg-opacity-90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-secondary-900 truncate">
                            {item.filename}
                          </p>
                          <p className="text-xs text-secondary-500">
                            {new Date(item.uploadedAt).toLocaleString()}
                          </p>
                        </div>
                        <Image className="w-5 h-5 text-primary-500 flex-shrink-0" />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Reports Section */}
          <div>
            <h3 className="text-lg font-display font-semibold text-secondary-800 mb-4">Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evidence
                .filter(item => item.type === 'report')
                .map((item) => (
                  <div
                    key={item.id}
                    className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-primary-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-secondary-900 truncate">
                          {item.filename}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {new Date(item.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-full hover:bg-secondary-100 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-primary-500" />
                        </a>
                        <button
                          onClick={() => handleDeleteEvidence(item.id)}
                          className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Specimens Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TestTube className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-display font-semibold text-secondary-800">Specimens</h2>
          </div>
          <button
            onClick={() => setShowNewSpecimenModal(true)}
            className="flex items-center px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Specimen
          </button>
        </div>

        <div className="space-y-4">
          {specimens.map((specimen) => (
            <div key={specimen.id} className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 transition-colors group">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-display font-semibold text-secondary-900">
                    {specimen.name}
                    <span className="ml-2 text-sm font-medium text-secondary-500">
                      (Quantity: {specimen.quantity})
                    </span>
                  </h3>
                  <p className="text-secondary-600 mt-1">{specimen.description}</p>
                  <div className="mt-2 flex gap-4 text-sm font-medium text-secondary-500">
                    <span>Type: {specimen.type}</span>
                    <span>Collected: {new Date(specimen.collection_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowNewTestModal(specimen.id)}
                    className="flex items-center px-3 py-1.5 bg-primary-50 text-primary-700 rounded-md hover:bg-primary-100 transition-colors font-medium"
                  >
                    <Beaker className="w-4 h-4 mr-1.5" />
                    Add Test
                  </button>
                  <button
                    onClick={() => handleDeleteSpecimen(specimen.id)}
                    className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>

              {/* Tests List */}
              <div className="space-y-3">
                {specimen.tests.map((test) => (
                  <div key={test.id} className="bg-secondary-50 rounded-md p-3 group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-display font-medium text-secondary-900">{test.name}</h4>
                        <p className="text-sm text-secondary-600 mt-1">{test.description}</p>
                        {test.results && (
                          <div className="mt-2 bg-white p-3 rounded border border-secondary-200">
                            <h5 className="text-sm font-medium text-secondary-900 mb-1">Results:</h5>
                            <p className="text-sm text-secondary-600">{test.results}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-secondary-500">
                          <RotateCw className="w-4 h-4 inline mr-1" />
                          {test.repeats} {test.repeats === 1 ? 'repeat' : 'repeats'}
                        </span>
                        <button
                          onClick={() => handleDeleteTest(specimen.id, test.id)}
                          className="p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover :bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <PreviewModal
          imageUrl={previewImage.url}
          filename={previewImage.filename}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {/* New Specimen Modal */}
      {showNewSpecimenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Specimen</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newSpecimen.name}
                  onChange={(e) => setNewSpecimen(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newSpecimen.description}
                  onChange={(e) => setNewSpecimen(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <input
                  type="text"
                  value={newSpecimen.type}
                  onChange={(e) => setNewSpecimen(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={newSpecimen.quantity}
                  onChange={(e) => setNewSpecimen(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Collection Date</label>
                <input
                  type="date"
                  value={newSpecimen.collection_date}
                  onChange={(e) => setNewSpecimen(prev => ({ ...prev, collection_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowNewSpecimenModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSpecimen}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Specimen
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Test Modal */}
      {showNewTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Test</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Name</label>
                <input
                  type="text"
                  value={newTest.name}
                  onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTest.description}
                  onChange={(e) => setNewTest(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Repeats</label>
                <input
                  type="number"
                  min="1"
                  value={newTest.repeats}
                  onChange={(e) => setNewTest(prev => ({ ...prev, repeats: parseInt(e.target.value) || 1 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Results</label>
                <textarea
                  value={newTest.results}
                  onChange={(e) => setNewTest(prev => ({ ...prev, results: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder="Enter test results..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowNewTestModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddTest(showNewTestModal)}
                disabled={isSaving}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Test
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <DeleteConfirmationModal
          title={deleteConfirmation.title}
          message={deleteConfirmation.message}
          onConfirm={() => {
            if (deleteConfirmation.type === 'evidence') {
              handleDeleteEvidence(deleteConfirmation.id);
            } else if (deleteConfirmation.type === 'specimen') {
              handleDeleteSpecimen(deleteConfirmation.id);
            } else if (deleteConfirmation.type === 'test' && deleteConfirmation.specimenId) {
              handleDeleteTest(deleteConfirmation.specimenId, deleteConfirmation.id);
            }
            setDeleteConfirmation(null);
          }}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}
    </div>
  );
}