'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, Lock, CheckCircle2, ExternalLink } from 'lucide-react';

interface AuthInfoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export function AuthInfoModal({ open, onOpenChange, onConfirm }: AuthInfoModalProps) {
    const [understood, setUnderstood] = useState(false);

    const handleConfirm = () => {
        if (understood) {
            onConfirm();
            onOpenChange(false);
            setUnderstood(false); // Reset para próxima vez
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-6 w-6 text-blue-600" />
                        <DialogTitle>Autenticação Segura</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="text-left space-y-3 text-sm text-muted-foreground">
                    <p>
                        Você será redirecionado para fazer login com sua conta Google através do{' '}
                        <strong>Supabase</strong>, nosso provedor de autenticação seguro.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-start gap-2">
                            <Lock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <strong className="text-blue-900">Por que Supabase?</strong>
                                <p className="text-blue-800 mt-1">
                                    Supabase é uma plataforma de backend confiável usada por milhares de aplicações.
                                    Eles gerenciam a autenticação de forma segura, seguindo as melhores práticas
                                    da indústria.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="font-medium text-sm">O que acontece durante o login:</p>
                        <ul className="space-y-1.5 text-sm">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Você verá uma tela do Google pedindo permissão</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>O domínio <code className="bg-gray-100 px-1 rounded">*.supabase.co</code> aparecerá na URL</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>Após autorizar, você retornará automaticamente para nossa aplicação</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Shield className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                                <strong className="text-green-900">100% Seguro</strong>
                                <p className="text-green-800 mt-1">
                                    Suas credenciais nunca são compartilhadas conosco. O Google gerencia todo o
                                    processo de autenticação de forma segura.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2">
                        <Checkbox
                            id="understood"
                            checked={understood}
                            onCheckedChange={(checked) => setUnderstood(checked as boolean)}
                        />
                        <label
                            htmlFor="understood"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                            Entendi e confio neste processo de autenticação
                        </label>
                    </div>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="w-full sm:w-auto"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!understood}
                        className="w-full sm:w-auto"
                    >
                        Continuar para Login
                        <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
