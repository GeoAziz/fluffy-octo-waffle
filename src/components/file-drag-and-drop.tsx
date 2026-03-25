'use client';

import { DragEvent, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { FileText, Trash2, UploadCloud, FileCheck, Map, Shield, Info } from 'lucide-react';
import Image from 'next/image';
import { FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FileDragAndDropProps {
  name: string;
  label: string;
  description?: string;
  accept?: string;
  multiple?: boolean;
  isEvidence?: boolean;
  maxSizeMB?: number;
}

const EVIDENCE_CATEGORIES = [
  { value: 'title_deed', label: 'Title Deed', icon: Shield, required: true },
  { value: 'survey_map', label: 'Survey Map', icon: Map, required: false },
  { value: 'id_document', label: 'Seller ID/PIN', icon: FileCheck, required: true },
  { value: 'rate_clearance', label: 'Rate Clearance', icon: FileText, required: false },
  { value: 'other', label: 'Other Support', icon: FileText, required: false },
];

export function FileDragAndDrop({ 
  name, 
  label, 
  description, 
  accept, 
  multiple = true, 
  isEvidence = false,
  maxSizeMB = 10 
}: FileDragAndDropProps) {
  const { setValue, watch, clearErrors, setError } = useFormContext();
  const existingFiles: FileList | undefined = watch(name);
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileCategories, setFileCategories] = useState<Record<number, string>>({});

  const files = existingFiles ? Array.from(existingFiles) : [];

  const validateFile = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `File "${file.name}" exceeds the ${maxSizeMB}MB limit.`;
    }
    return null;
  };

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
    processFiles(droppedFiles);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
  };

  const processFiles = (newlySelected: File[]) => {
    if (!newlySelected.length) return;

    const errors: string[] = [];
    const validated = newlySelected.filter(f => {
      const error = validateFile(f);
      if (error) errors.push(error);
      return !error;
    });

    if (errors.length > 0) {
      setError(name, { type: 'manual', message: errors[0] });
      return;
    }

    clearErrors(name);
    const finalFiles = multiple ? [...files, ...validated] : [validated[0]];
    updateFormFiles(finalFiles);
  };

  const updateFormFiles = (newFiles: File[]) => {
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    setValue(name, dataTransfer.files, { shouldValidate: true, shouldDirty: true });
    
    if (isEvidence) {
      const newCategories = { ...fileCategories };
      newFiles.forEach((_, idx) => {
        if (!newCategories[idx]) newCategories[idx] = 'other';
      });
      setFileCategories(newCategories);
    }
  };

  const removeFile = (indexToRemove: number) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    const dataTransfer = new DataTransfer();
    newFiles.forEach(file => dataTransfer.items.add(file));
    setValue(name, newFiles.length > 0 ? dataTransfer.files : undefined, { shouldValidate: true, shouldDirty: true });
    
    const newCategories: Record<number, string> = {};
    newFiles.forEach((_, idx) => {
      const oldIdx = idx >= indexToRemove ? idx + 1 : idx;
      if (fileCategories[oldIdx]) newCategories[idx] = fileCategories[oldIdx];
    });
    setFileCategories(newCategories);
  };

  const handleCategoryChange = (index: number, value: string) => {
    setFileCategories(prev => ({ ...prev, [index]: value }));
    setValue(`${name}_categories`, { ...fileCategories, [index]: value });
  };

  const FilePreview = ({ file, index }: { file: File; index: number }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const isImage = file.type.startsWith('image/');
    
    useEffect(() => {
      let objectUrl: string | null = null;
      if (isImage) {
        objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      }
      return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
    }, [file, isImage]);

    return (
      <div className="group relative flex flex-col rounded-xl border border-border/60 bg-background/50 p-4 transition-all hover:shadow-md hover:border-primary/30">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border border-border/40 bg-muted shadow-sm flex items-center justify-center">
              {previewUrl ? (
                <Image src={previewUrl} alt="" fill className="object-cover" />
              ) : (
                <FileText className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black truncate text-foreground leading-tight" title={file.name}>{file.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[9px] font-bold text-muted-foreground uppercase">{(file.size / 1024).toFixed(0)} KB</p>
                <span className="text-muted-foreground/30">•</span>
                <p className="text-[9px] font-bold text-muted-foreground uppercase truncate">{file.type.split('/')[1] || 'FILE'}</p>
              </div>
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
            <div className="flex items-center justify-between">
              <Label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Verification Category</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[200px] text-[10px]">
                    Accurate categorization speeds up the AI review and manual verification process.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select 
              value={fileCategories[index] || 'other'} 
              onValueChange={(v) => handleCategoryChange(index, v)}
            >
              <SelectTrigger className="h-9 text-xs font-bold bg-background border-border/40">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {EVIDENCE_CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <SelectItem key={cat.value} value={cat.value} className="text-xs font-medium">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5" />
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
          <FormLabel className="text-sm font-black uppercase tracking-tight text-foreground">{label}</FormLabel>
          {description && <FormDescription className="text-xs font-medium text-muted-foreground">{description}</FormDescription>}
        </div>
        {files.length > 0 && (
          <Badge className="bg-primary text-white border-none font-black text-[10px] uppercase h-6 px-3">
            {files.length} {files.length === 1 ? 'Asset' : 'Assets'} Stage
          </Badge>
        )}
      </div>

      <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
          'relative flex flex-col items-center justify-center w-full p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 group',
          isDragOver 
            ? 'border-primary bg-primary/5 shadow-inner scale-[0.99]' 
            : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
          )}
      >
          <div className="mb-4 rounded-full bg-muted p-4 group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-500 shadow-sm">
            <UploadCloud className={cn("h-10 w-10 transition-colors", isDragOver ? "text-primary" : "text-muted-foreground")} />
          </div>
          <div className="text-center space-y-1">
            <p className="text-sm font-black uppercase tracking-tight text-foreground">
              {isDragOver ? "Commit Files Now" : "Vault Your Proof"}
            </p>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
              Drag & Drop or click to browse
            </p>
            <p className="text-[10px] text-muted-foreground/60 font-medium pt-2">
              Max file size: {maxSizeMB}MB • PDF, JPG, PNG accepted
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {files.map((file, index) => (
                  <FilePreview key={`${file.name}-${index}`} file={file} index={index} />
              ))}
          </div>
      )}

      <FormMessage />
    </FormItem>
  );
}
