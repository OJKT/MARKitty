"use client";

import { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { TemplatePreview } from "./template-preview";
import { useAuth } from "@/lib/context/auth-context";
import { usePreferences } from "@/lib/hooks/use-preferences";
import type { Template, CoverSheetData } from "@/lib/types/cover-sheet";
import { FileText, Download, Upload } from "lucide-react";

const DEFAULT_TEMPLATE = `Cover Sheet

Learner Name: {{learnerName}}
Assignment Title: {{assignmentTitle}}

Declaration:
{{learnerDeclaration}}

Date: ${new Date().toLocaleDateString()}`;

const DEFAULT_DECLARATION = "I declare that this is my own work and that I have not plagiarized any content.";

export function CoverSheetGenerator() {
  const { toast } = useToast();
  const { isLoggedIn, user, login, logout } = useAuth();
  const { preferences, saveTemplate, saveDeclaration } = usePreferences();

  const [formData, setFormData] = useState<CoverSheetData>({
    learnerName: "",
    assignmentTitle: "",
    learnerDeclaration: DEFAULT_DECLARATION
  });

  const [template, setTemplate] = useState<Template>({
    id: "default",
    name: "Default Template",
    content: DEFAULT_TEMPLATE,
    type: "docx"
  });

  // Load preferences when logged in
  useEffect(() => {
    if (isLoggedIn) {
      if (preferences.lastUsedTemplate) {
        setTemplate(preferences.lastUsedTemplate);
      }
      if (preferences.defaultDeclaration) {
        setFormData(prev => ({
          ...prev,
          learnerDeclaration: preferences.defaultDeclaration || DEFAULT_DECLARATION
        }));
      }
      if (user) {
        setFormData(prev => ({
          ...prev,
          learnerName: user.name
        }));
      }
    }
  }, [isLoggedIn, preferences, user]);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newTemplate: Template = {
          id: Date.now().toString(),
          name: file.name,
          content: event.target.result as string,
          type: file.name.endsWith('.pdf') ? 'pdf' : 'docx'
        };
        setTemplate(newTemplate);
        if (isLoggedIn) {
          saveTemplate(newTemplate);
        }
      }
    };
    reader.readAsText(file);
  }, [isLoggedIn, saveTemplate]);

  const handleInputChange = useCallback((
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'learnerDeclaration' && isLoggedIn) {
      saveDeclaration(value);
    }
  }, [isLoggedIn, saveDeclaration]);

  const handleExport = useCallback((format: 'pdf' | 'docx') => {
    // Mock export function
    toast({
      title: "Export Started",
      description: `Downloading cover sheet as ${format.toUpperCase()}...`,
    });
  }, [toast]);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Cover Sheet Generator</h2>
          <div className="flex items-center gap-2">
            <Switch
              checked={isLoggedIn}
              onCheckedChange={(checked: boolean) => checked ? login() : logout()}
            />
            <span className="text-sm text-muted-foreground">
              {isLoggedIn ? 'Logged In' : 'Free Mode'}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label htmlFor="template">Template Upload</Label>
            <Input
              id="template"
              type="file"
              accept=".docx,.pdf"
              onChange={handleFileUpload}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Upload a .docx or .pdf file with merge tags (e.g. {`{{learnerName}}`})
            </p>
          </div>

          <div className="grid gap-4">
            <div>
              <Label htmlFor="learnerName">Learner Name</Label>
              <Input
                id="learnerName"
                name="learnerName"
                value={formData.learnerName}
                onChange={handleInputChange}
                disabled={isLoggedIn}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="assignmentTitle">Assignment Title</Label>
              <Input
                id="assignmentTitle"
                name="assignmentTitle"
                value={formData.assignmentTitle}
                onChange={handleInputChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="learnerDeclaration">Learner Declaration</Label>
              <Textarea
                id="learnerDeclaration"
                name="learnerDeclaration"
                value={formData.learnerDeclaration}
                onChange={handleInputChange}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Preview</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('docx')}
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Export DOCX
            </Button>
          </div>
        </div>

        <TemplatePreview 
          template={template.content}
          data={formData}
        />
      </div>
    </div>
  );
} 