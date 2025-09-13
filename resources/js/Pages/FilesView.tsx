import type React from "react";

import { useState } from "react";
import { Button } from "@/Components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Badge } from "@/Components/ui/badge";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import {
    FileText,
    Upload,
    Download,
    Trash2,
    Eye,
    ImageIcon,
    FileVideo,
    FileAudio,
    File,
    Search,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/Components/ui/dialog";

interface Archivo {
    id: string;
    filename: string;
    mime: string;
    size_bytes: number;
    storage_path: string;
    created_at: string;
    preview_url?: string;
}

interface Archivable {
    archivo_id: string;
    archivable_type: string;
    archivable_id: string;
    archivo: Archivo;
}

export function FilesView() {
    const [archivos, setArchivos] = useState<Archivo[]>([
        {
            id: "1",
            filename: "Propuesta_Proyecto_ERP.pdf",
            mime: "application/pdf",
            size_bytes: 2048576,
            storage_path: "/storage/files/propuesta.pdf",
            created_at: "2025-01-08T10:30:00Z",
        },
        {
            id: "2",
            filename: "Mockup_Dashboard.png",
            mime: "image/png",
            size_bytes: 1024000,
            storage_path: "/storage/files/mockup.png",
            created_at: "2025-01-07T15:45:00Z",
            preview_url: "/dashboard-mockup.png",
        },
        {
            id: "3",
            filename: "Reunion_Equipo_Audio.mp3",
            mime: "audio/mpeg",
            size_bytes: 5242880,
            storage_path: "/storage/files/audio.mp3",
            created_at: "2025-01-06T09:15:00Z",
        },
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    const [showUploadDialog, setShowUploadDialog] = useState(false);

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return (
            Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
            " " +
            sizes[i]
        );
    };

    const getFileIcon = (mime: string) => {
        if (mime.startsWith("image/")) return ImageIcon;
        if (mime.startsWith("video/")) return FileVideo;
        if (mime.startsWith("audio/")) return FileAudio;
        if (mime === "application/pdf") return FileText;
        return File;
    };

    const getFileTypeColor = (mime: string) => {
        if (mime.startsWith("image/")) return "bg-green-100 text-green-800";
        if (mime.startsWith("video/")) return "bg-purple-100 text-purple-800";
        if (mime.startsWith("audio/")) return "bg-blue-100 text-blue-800";
        if (mime === "application/pdf") return "bg-red-100 text-red-800";
        return "bg-gray-100 text-gray-800";
    };

    const filteredArchivos = archivos.filter((archivo) =>
        archivo.filename.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            const newArchivo: Archivo = {
                id:
                    Date.now().toString() +
                    Math.random().toString(36).substr(2, 9),
                filename: file.name,
                mime: file.type,
                size_bytes: file.size,
                storage_path: `/storage/files/${file.name}`,
                created_at: new Date().toISOString(),
                preview_url: file.type.startsWith("image/")
                    ? URL.createObjectURL(file)
                    : undefined,
            };
            setArchivos((prev) => [...prev, newArchivo]);
        });
        setShowUploadDialog(false);
    };

    const handleDeleteFile = (id: string) => {
        setArchivos((prev) => prev.filter((archivo) => archivo.id !== id));
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Archivos</h1>
                    <p className="text-muted-foreground">
                        Gestiona tus archivos y adjuntos
                    </p>
                </div>
                <Dialog
                    open={showUploadDialog}
                    onOpenChange={setShowUploadDialog}
                >
                    <DialogTrigger asChild>
                        <Button>
                            <Upload className="mr-2 h-4 w-4" />
                            Subir Archivo
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Subir Nuevo Archivo</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="file-upload">
                                    Seleccionar Archivos
                                </Label>
                                <Input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    onChange={handleFileUpload}
                                    className="cursor-pointer"
                                />
                                <p className="text-sm text-muted-foreground mt-2">
                                    Máximo 10MB por archivo. Soporta imágenes,
                                    PDFs, audio y video.
                                </p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Búsqueda */}
            <Card>
                <CardContent className="pt-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar archivos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {archivos.length}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Total Archivos
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {formatFileSize(
                                        archivos.reduce(
                                            (total, archivo) =>
                                                total + archivo.size_bytes,
                                            0
                                        )
                                    )}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Espacio Usado
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-2xl font-bold">
                                    {
                                        archivos.filter((a) =>
                                            a.mime.startsWith("image/")
                                        ).length
                                    }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Imágenes
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Lista de Archivos */}
            <Card>
                <CardHeader>
                    <CardTitle>Archivos Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredArchivos.length === 0 ? (
                        <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                            <p className="text-muted-foreground">
                                No se encontraron archivos
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredArchivos.map((archivo) => {
                                const FileIcon = getFileIcon(archivo.mime);
                                return (
                                    <div
                                        key={archivo.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                {archivo.preview_url ? (
                                                    <img
                                                        src={
                                                            archivo.preview_url ||
                                                            "/placeholder.svg"
                                                        }
                                                        alt={archivo.filename}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                                                        <FileIcon className="h-6 w-6 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3
                                                    className="font-medium truncate"
                                                    title={archivo.filename}
                                                >
                                                    {archivo.filename}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge
                                                        className={`text-xs ${getFileTypeColor(
                                                            archivo.mime
                                                        )}`}
                                                    >
                                                        {archivo.mime
                                                            .split("/")[1]
                                                            .toUpperCase()}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        {formatFileSize(
                                                            archivo.size_bytes
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {new Date(
                                                        archivo.created_at
                                                    ).toLocaleDateString(
                                                        "es-ES"
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 mt-3">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 bg-transparent"
                                            >
                                                <Eye className="h-3 w-3 mr-1" />
                                                Ver
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1 bg-transparent"
                                            >
                                                <Download className="h-3 w-3 mr-1" />
                                                Descargar
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleDeleteFile(archivo.id)
                                                }
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
