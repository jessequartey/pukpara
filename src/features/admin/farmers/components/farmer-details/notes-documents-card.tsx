"use client";

import { useState } from "react";
import { FileText, Plus, Calendar, User, Image, File, Download, Eye, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type NotesDocumentsCardProps = {
  farmerId: string;
};

type Note = {
  id: string;
  content: string;
  author: string;
  authorRole: string;
  createdAt: string;
  category: "general" | "kyc" | "farming" | "financial" | "compliance";
  isImportant: boolean;
};

type Document = {
  id: string;
  name: string;
  type: "id_scan" | "farm_photo" | "certificate" | "contract" | "other";
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  url: string;
};

export function NotesDocumentsCard({ farmerId }: NotesDocumentsCardProps) {
  const [newNote, setNewNote] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  // Mock notes data - replace with actual API call
  const notes: Note[] = [
    {
      id: "1",
      content: "Farmer completed KYC verification successfully. All documents are in order and identity has been confirmed.",
      author: "Sarah Johnson",
      authorRole: "KYC Officer",
      createdAt: "2024-03-15T10:30:00Z",
      category: "kyc",
      isImportant: true,
    },
    {
      id: "2",
      content: "Farm inspection completed. Cocoa trees are in good condition, estimated yield for this season is 400-500kg.",
      author: "Michael Asante",
      authorRole: "Field Officer",
      createdAt: "2024-03-10T14:45:00Z",
      category: "farming",
      isImportant: false,
    },
    {
      id: "3",
      content: "Loan application submitted for agricultural inputs. Supporting documents attached.",
      author: "Grace Owusu",
      authorRole: "Loan Officer",
      createdAt: "2024-02-28T09:15:00Z",
      category: "financial",
      isImportant: false,
    },
  ];

  // Mock documents data
  const documents: Document[] = [
    {
      id: "1",
      name: "Ghana_Card_Front.jpg",
      type: "id_scan",
      fileSize: 245760,
      mimeType: "image/jpeg",
      uploadedBy: "System",
      uploadedAt: "2024-01-15T10:30:00Z",
      description: "Front side of Ghana Card for KYC verification",
      url: "/uploads/farmer-123/ghana-card-front.jpg",
    },
    {
      id: "2",
      name: "Ghana_Card_Back.jpg",
      type: "id_scan",
      fileSize: 198432,
      mimeType: "image/jpeg",
      uploadedBy: "System",
      uploadedAt: "2024-01-15T10:31:00Z",
      description: "Back side of Ghana Card for KYC verification",
      url: "/uploads/farmer-123/ghana-card-back.jpg",
    },
    {
      id: "3",
      name: "Farm_Aerial_View.jpg",
      type: "farm_photo",
      fileSize: 512000,
      mimeType: "image/jpeg",
      uploadedBy: "Michael Asante",
      uploadedAt: "2024-02-10T14:20:00Z",
      description: "Aerial view of the main cocoa farm showing tree coverage",
      url: "/uploads/farmer-123/farm-aerial.jpg",
    },
    {
      id: "4",
      name: "Organic_Certificate.pdf",
      type: "certificate",
      fileSize: 156789,
      mimeType: "application/pdf",
      uploadedBy: "Grace Owusu",
      uploadedAt: "2024-01-20T11:45:00Z",
      description: "Organic farming certification document",
      url: "/uploads/farmer-123/organic-cert.pdf",
    },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  const getCategoryVariant = (category: string) => {
    switch (category) {
      case "kyc":
        return "default";
      case "farming":
        return "secondary";
      case "financial":
        return "outline";
      case "compliance":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "id_scan":
        return <FileText className="h-4 w-4 text-blue-600" />;
      case "farm_photo":
        return <Image className="h-4 w-4 text-green-600" />;
      case "certificate":
        return <File className="h-4 w-4 text-purple-600" />;
      case "contract":
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <File className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      // TODO: Implement actual API call to add note
      console.log("Adding note:", newNote);
      setNewNote("");
      setIsAddingNote(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Notes & Documents
        </CardTitle>
        <CardDescription>
          Internal notes and uploaded documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes ({notes.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              Documents ({documents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex justify-between">
              <h4 className="font-medium text-sm">Recent Notes</h4>
              <Dialog open={isAddingNote} onOpenChange={setIsAddingNote}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Note</DialogTitle>
                    <DialogDescription>
                      Add a note about this farmer for internal reference
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="note-content">Note Content</Label>
                      <Textarea
                        id="note-content"
                        placeholder="Enter your note here..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsAddingNote(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddNote}>
                        Add Note
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-medium">No Notes</h3>
                <p className="mb-4 text-muted-foreground text-sm">
                  No notes have been added for this farmer yet.
                </p>
                <Button onClick={() => setIsAddingNote(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Note
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={getCategoryVariant(note.category)}>
                          {note.category}
                        </Badge>
                        {note.isImportant && (
                          <Badge variant="destructive">Important</Badge>
                        )}
                      </div>
                      <Button size="sm" variant="ghost">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm">{note.content}</p>
                    <div className="flex items-center gap-4 text-muted-foreground text-xs">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{note.author} ({note.authorRole})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div className="flex justify-between">
              <h4 className="font-medium text-sm">Uploaded Documents</h4>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </div>

            {documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <File className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 font-medium">No Documents</h3>
                <p className="mb-4 text-muted-foreground text-sm">
                  No documents have been uploaded for this farmer yet.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      {getDocumentIcon(document.type)}
                      <div>
                        <p className="font-medium text-sm">{document.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {document.description || "No description"}
                        </p>
                        <div className="flex items-center gap-4 text-muted-foreground text-xs">
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span>Uploaded by {document.uploadedBy}</span>
                          <span>{formatDate(document.uploadedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}