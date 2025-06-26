'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Instagram, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; 

export default function Follow() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    instagram: '',
    telefone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [errors, setErrors] = useState<{instagram?: string}>({});
  


  const instagramProfileUrl = 'https://www.instagram.com/kabasacocamping';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  
  if (name === 'instagram') {
    // Remove all @ symbols and add only one at the start
    const cleanValue = value.replace(/@/g, '');
    const newValue = cleanValue ? `@${cleanValue}` : '';
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error when user starts typing
    if (errors.instagram) {
      setErrors(prev => ({ ...prev, instagram: '' }));
    }
  } else if (name === 'telefone') {
    // Aplica a máscara de telefone
    const digits = value.replace(/\D/g, '');
    let formattedValue = '';
    
    if (digits.length <= 10) {
      // Formato: (99) 9999-9999
      formattedValue = digits.replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2$3').trim();
      if (digits.length > 2 && digits.length <= 6) {
        formattedValue = formattedValue.replace(/(\)\s)(\d{4})/, ') $2');
      } else if (digits.length > 6) {
        formattedValue = formattedValue.replace(/(\d{4})(\d{1,4})/, '$1-$2');
      }
    } else {
      // Formato: (99) 99999-9999
      formattedValue = digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    }
    
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
};

const validateForm = () => {
  const newErrors: {instagram?: string} = {};
  
  // Check if the handle has exactly one @ at the start and is at least 2 characters long (including @)
  if (!/^@[^@]+$/.test(formData.instagram) || formData.instagram.length < 2) {
    newErrors.instagram = 'Por favor, insira um @ do Instagram válido';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) {
    return;
  }
  
  // Apenas mostra o modal de seguir, não envia os dados ainda
  setIsDialogOpen(false);
  setShowFollowModal(true);
};

const handleFollowClick = async () => {
  setIsSubmitting(true);
  
  try {
    // Envia os dados quando o usuário clicar em seguir
    const response = await fetch('https://an-sorteador-production.up.railway.app/participants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.nome,
        phone: formData.telefone.replace(/\D/g, ''), // Remove non-numeric characters
        perfil_ig: formData.instagram
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Erro ao cadastrar participante');
    }

    // Abre o Instagram em uma nova aba
    window.open(instagramProfileUrl, '_blank');
    
    // Mostra mensagem de sucesso
    setShowFollowModal(false);
    setIsSuccess(true);
    
    // Reseta o formulário após 3 segundos
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({ nome: '', instagram: '', telefone: '' });
    }, 3000);
    
  } catch (error: unknown) {
    console.error('Erro ao enviar formulário:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao processar sua inscrição. Por favor, tente novamente.';
    alert(errorMessage);
    setShowFollowModal(false);
  } finally {
    setIsSubmitting(false);
  }
};



  const isFormValid = 
    formData.nome.trim() !== '' && 
    formData.instagram.trim() !== '' && 
    formData.telefone.trim() !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-gray-900 flex items-center justify-center p-4">
      <AnimatePresence>
        {/* Tela de sucesso */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="bg-white p-8 rounded-2xl shadow-2xl text-center"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscrição confirmada!</h2>
              <p className="text-gray-600">Agora é só aguardar o resultado do sorteio!</p>
            </motion.div>
          </motion.div>
        )}

        {/* Conteúdo principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-white/5 backdrop-blur-md border-white/10 shadow-xl overflow-hidden">
            <div className="relative h-48 bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="relative z-10 text-center p-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                  <Instagram className="h-8 w-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Participe do Sorteio!</h1>
                <p className="text-white/90">Siga nosso perfil no Instagram para participar</p>
              </div>
            </div>
            
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-white">Como participar:</h2>
                  <ul className="space-y-3 text-white/80">
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-pink-400 text-sm">1</span>
                      </span>
                      Siga nosso perfil no Instagram
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-pink-400 text-sm">2</span>
                      </span>
                      Preencha o formulário com seu @ 
                    </li>
                    <li className="flex items-start">
                      <span className="flex-shrink-0 w-6 h-6 bg-pink-500/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-pink-400 text-sm">3</span>
                      </span>
                      Aguarde o resultado do sorteio!
                    </li>
                  </ul>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-6 text-lg transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
                  size="lg"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Preencher formulário
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de Confirmação de Seguir */}
        <Dialog open={showFollowModal} onOpenChange={setShowFollowModal}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 border-white/10">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mb-4">
                <Instagram className="h-8 w-8 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Atenção!</h3>
              <p className="text-white/80 mb-6">
                Para participar do sorteio, você precisa seguir nosso perfil no Instagram. Caso não siga, sua inscrição não será válida.
              </p>
              <div className="w-full space-y-3">
                <Button
                  onClick={handleFollowClick}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium py-6 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Instagram className="mr-2 h-5 w-5" />
                      Seguir no Instagram
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowFollowModal(false)}
                  variant="outline"
                  disabled={isSubmitting}
                  className="w-full bg-transparent border-white/20 text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Inscrição */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 border-white/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white">Complete sua inscrição</DialogTitle>
              <DialogDescription className="text-white/70">
                Preencha os campos abaixo para participar do sorteio
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                  <Label htmlFor="nome" className="text-white/80 mb-2 block">
                    Seu nome
                  </Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    placeholder="Seu nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="instagram" className="text-white/80 mb-2 block">
                    Seu @ do Instagram
                  </Label>
                  <div className="relative">
  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
    @
  </div>
  <Input
    id="instagram"
    name="instagram"
    type="text"
    placeholder="seuusuario"
    value={formData.instagram.replace(/^@+/, '')}
    onChange={handleInputChange}
    onBlur={(e) => {
      // Ensure @ is added when leaving the field if not empty
      if (e.target.value && !e.target.value.startsWith('@')) {
        handleInputChange({
          target: { name: 'instagram', value: e.target.value }
        } as React.ChangeEvent<HTMLInputElement>);
      }
    }}
    className={`bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent pl-8 ${errors.instagram ? 'border-red-500' : ''}`}
    required
  />
  {errors.instagram && (
    <p className="mt-1 text-sm text-red-400">{errors.instagram}</p>
  )}
</div>
                </div>
                <div>
                  <Label htmlFor="telefone" className="text-white/80 mb-2 block">
                    Seu numero de telefone
                  </Label>
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    required
                    maxLength={15}
                  />    
                </div>
              <div className="flex space-x-3 ">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 bg-transparent border-white/20 hover:bg-white/10 text-white"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-medium"
                  disabled={isSubmitting || !isFormValid}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Enviando...
                    </div>
                  ) : (
                    'Confirmar Inscrição'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </AnimatePresence>
    </div>
  );
}