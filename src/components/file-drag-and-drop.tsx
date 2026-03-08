'use client';

import { DragEvent, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { FileText, Trash2, UploadCloud, FileCheck, Map, Shield, BadgeAlert, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface FileDragAndDropProps {
  name: string;
  label: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  isEvidence?: boolean;
}

const EVIDENCE_CATEGORIES = [
  { value: 'title_deed', label: 'Title Deed', icon: Shield },
  { value: 'survey_map', label: 'Survey Map', icon: Map },
  { value: 'id_document', label: 'Seller ID/PIN', icon: FileCheck },
  { value: 'rate_clearance', label: 'Rate Clearance', icon: FileText },
  { value: 'other', label: 'Other Support', icon: FileText },
];

export function FileDragAndDrop({ name, label, description, accept, multiple = true, isEvidence = false }: FileDragAndDropProps) {
  const { setValue, watch } = useFormContext();
  const existingFiles: FileList | undefined = watch(name);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileCategories, setFileCategories] = useState<Record<number, string>>({});

  const files = existingFiles ? Array.from(existingFiles) : [];

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (!droppedFiles.length) return;

    const newFiles = multiple ? [...files, ...droppedFiles] : [droppedFiles[0]];
    updateFormFiles(newFiles);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const newFiles = multiple ? [...files, ...selectedFiles] : [selectedFiles[0]];
    updateFormFiles(newFiles);
  };

  const updateFormFiles = (newFiles: File[]) => {
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    setValue(name, dataTransfer.files, { shouldValidate: true, shouldDirty: true });
    
    // Auto-set category if only one file and it's evidence
    if (isEvidence && newFiles.length === 1 && !fileCategories[0]) {
      setFileCategories({ 0: 'other' });
    }
  };

  const removeFile = (indexToRemove: number) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    setValue(name, newFiles.length > 0 ? dataTransfer.files : undefined, { shouldValidate: true, shouldDirty: true });
    
    // Update categories map
    const newCategories: Record<number, string> = {};
    newFiles.forEach((_, idx) => {
      const oldIdx = idx >= indexToRemove ? idx + 1 : idx;
      if (fileCategories[oldIdx]) newCategories[idx] = fileCategories[oldIdx];
    });
    setFileCategories(newCategories);
  };

  const handleCategoryChange = (index: number, value: string) => {
    setFileCategories(prev => ({ ...prev, [index]: value }));
    // In a real app, we'd store these categories in a hidden field or metadata object
    setValue(`${name}_categories`, { ...fileCategories, [index]: value });
  };

  const FilePreview = ({ file, index }: { file: File; index: number }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    
    useEffect(() => {
      let objectUrl: string | null = null;
      if (file.type.startsWith('image/')) {
        objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      }
      
      return () => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      };
    }, [file]);

    return (
      <div className="group relative flex flex-col rounded-xl border border-border/60 bg-background/50 p-3 transition-all hover:shadow-md hover:border-primary/20">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 overflow-hidden">
            {previewUrl ? (
              <div className="relative w-12 h-12 aspect-square rounded-lg overflow-hidden flex-shrink-0 border border-border/40 shadow-sm">
                  <Image src={previewUrl} alt={file.name} fill className="object-cover"/>
              </div>
            ) : (
              <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-secondary rounded-lg border border-border/40">
                  <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate text-foreground" title={file.name}>{file.name}</p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => removeFile(index)}
            className="p-1.5 text-muted-foreground rounded-full hover:bg-risk-light hover:text-risk transition-colors flex-shrink-0"
            aria-label={`Remove ${file.name}`}
          >
            <Trash2 className="w-4 w-4" />
          </button>
        </div>

        {isEvidence && (
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Document Type</Label>
            <Select 
              value={fileCategories[index] || 'other'} 
              onValueChange={(v) => handleCategoryChange(index, v)}
            >
              <SelectTrigger className="h-8 text-xs bg-background border-border/40">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {EVIDENCE_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-3 w-3" />
                        <span>{cat.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <FormItem className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <FormLabel className="text-sm font-bold text-foreground">{label}</FormLabel>
          {description && <FormDescription className="text-xs text-muted-foreground">{description}</FormDescription>}
        </div>
        {files.length > 0 && (
          <Badge variant="outline" className="h-6 bg-primary/5 text-primary border-primary/20 font-bold text-[10px] uppercase">
            {files.length} {files.length === 1 ? 'File' : 'Files'} Added
          </Badge>
        )}
      </div>

      <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
          'relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 group',
          isDragOver 
            ? 'border-primary bg-primary/5 shadow-inner scale-[0.99]' 
            : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
          )}
      >
          <div className="mb-3 rounded-full bg-muted p-3 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
            <UploadCloud className={cn("h-8 w-8 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-bold text-foreground">
              {isDragOver ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-muted-foreground font-medium">
              or click to browse local storage
            </p>
          </div>
          <input
              id={name}
              name={name}
              type="file"
              accept={accept}
              multiple={multiple}
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
      </div>
      
      {files.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {files.map((file, index) => (
                  <FilePreview key={`${file.name}-${index}`} file={file} index={index} />
              ))}
          </div>
      )}

      <FormMessage />
    </FormItem>
  );
}

function Label({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={className}>{children}</span>;
}
