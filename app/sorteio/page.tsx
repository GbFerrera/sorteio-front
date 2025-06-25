'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw, Award, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Interface para os participantes
interface Participant {
  id: string;
  nome: string;
  instagram: string;
  telefone: string;
  timestamp: string;
}

export default function SorteioPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [winner, setWinner] = useState<Participant | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isLoadingWinners, setIsLoadingWinners] = useState(false);
  const [error, setError] = useState('');

  // Senha de acesso (substitua por uma autenticação mais segura em produção)
  const ADMIN_PASSWORD = 'sorteio123'; // Altere para uma senha segura

  // Função para buscar os vencedores
  const fetchWinners = async () => {
    try {
      setIsLoadingWinners(true);
      const response = await fetch('https://an-sorteador-production.up.railway.app/participants');
      if (!response.ok) {
        throw new Error('Erro ao buscar vencedores');
      }
      const allParticipants = await response.json();
      // Filtrar apenas os vencedores
      const winnersOnly = allParticipants.filter((p: any) => p.is_winner === true);
      setWinners(winnersOnly);
    } catch (err) {
      console.error('Erro ao buscar vencedores:', err);
      setError('Erro ao carregar vencedores. Tente novamente.');
    } finally {
      setIsLoadingWinners(false);
    }
  };

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    const auth = localStorage.getItem('sorteio_auth');
    if (auth === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      // Buscar participantes e vencedores
      fetchParticipants();
      fetchWinners();
      // Atualizar a lista a cada 10 segundos
      const interval = setInterval(() => {
        fetchParticipants();
        fetchWinners();
      }, 10000);
      return () => clearInterval(interval);
    } else {
      setIsLoading(false);
    }
  }, []);



  // Função para buscar os participantes
  const fetchParticipants = async () => {
    try {
      const response = await fetch('https://an-sorteador-production.up.railway.app/participants');
      if (!response.ok) {
        throw new Error('Erro ao buscar participantes');
      }
      const data = await response.json();
      // Mapear os dados da API para o formato esperado pelo componente
      const formattedParticipants = data
        .filter((participant: any) => !participant.is_winner) // Filtrar apenas não-vencedores
        .map((participant: any) => ({
          id: participant.id.toString(),
          nome: participant.name,
          instagram: participant.perfil_ig,
          telefone: participant.phone,
          timestamp: new Date(participant.created_at).toISOString()
        }));
      setParticipants(formattedParticipants);
    } catch (err) {
      console.error('Erro ao buscar participantes:', err);
      setError('Erro ao carregar participantes. Tente atualizar a página.');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para realizar o sorteio
  const markAsWinner = async (participantId: string) => {
    try {
      const response = await fetch(`https://an-sorteador-production.up.railway.app/participants/winner/${participantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao marcar vencedor');
      }
      
      // Atualiza a lista de participantes após marcar o vencedor
      fetchParticipants();
      return true;
    } catch (error) {
      console.error('Erro ao marcar vencedor:', error);
      return false;
    }
  };

  const handleDraw = async () => {
    if (participants.length === 0) {
      setError('Nenhum participante para sortear');
      return;
    }

    setIsDrawing(true);
    setError('');
    setWinner(null);

    // Efeito visual de sorteio
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * participants.length);
      setWinner(participants[randomIndex]);
    }, 100);

    // Parar o sorteio após 3 segundos
    setTimeout(async () => {
      clearInterval(interval);
      const randomIndex = Math.floor(Math.random() * participants.length);
      const selectedWinner = participants[randomIndex];
      setWinner(selectedWinner);
      
      // Marca o vencedor no banco de dados
      const success = await markAsWinner(selectedWinner.id);
      if (success) {
        // Atualiza a lista de vencedores após o sorteio
        await fetchWinners();
      } else {
        setError('Erro ao salvar o vencedor. Tente novamente.');
      }
      
      setIsDrawing(false);
    }, 3000);
  };

  // Função para lidar com o login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('sorteio_auth', password);
      setIsAuthenticated(true);
      fetchParticipants();
    } else {
      setError('Senha incorreta');
    }
  };

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/5 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white text-center">Acesso Restrito</CardTitle>
            <CardDescription className="text-center text-white/70">
              Digite a senha para acessar a área de sorteio
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Erro</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Senha de acesso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Acessar
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    );
  }

  // Página principal do sorteio
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Painel de Sorteio</h1>
            <p className="text-white/70">
              {participants.length} participante(s) cadastrado(s)
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              onClick={fetchParticipants}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10"
              disabled={isLoading || isDrawing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button
              onClick={handleDraw}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              disabled={isLoading || isDrawing || participants.length === 0}
            >
              <Award className="mr-2 h-4 w-4" />
              {isDrawing ? 'Sorteando...' : 'Sortear Ganhador'}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {winner && (
          <Card className="mb-8 bg-gradient-to-r from-green-500/10 to-emerald-600/10 border-green-500/30">
            <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-400 flex items-center justify-center gap-2">
              <CheckCircle className="h-8 w-8" />
              Ganhador(a) do Sorteio!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{winner.instagram}</div>
            <div className="text-white/70 mb-1">{winner.nome}</div>
            <div className="text-white/70 mb-3">{winner.telefone}</div>
            <p className="text-green-300">
              Participou em {new Date(winner.timestamp).toLocaleString()}
            </p>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white/5 border-white/10 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl text-white">Participantes</CardTitle>
            <CardDescription className="text-white/70">
              Lista de todos os participantes do sorteio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-white/10">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-white/10">
                    <TableHead className="text-white">Nome</TableHead>
                    <TableHead className="text-white">Instagram</TableHead>
                    <TableHead className="text-white">Telefone</TableHead>
                    <TableHead className="text-white text-right">Data de Inscrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-white/50" />
                        <p className="mt-2 text-white/70">Carregando participantes...</p>
                      </TableCell>
                    </TableRow>
                  ) : participants.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-white/70">
                        Nenhum participante encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    participants.map((participant) => (
                      <TableRow key={participant.id} className="border-b border-white/10 hover:bg-white/5">
                        <TableCell className="text-white">
                          <div className="font-medium">{participant.nome}</div>
                        </TableCell>
                        <TableCell className="text-white">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-pink-400" />
                            {participant.instagram}
                          </div>
                        </TableCell>
                        <TableCell className="text-white/70">
                          {participant.telefone}
                        </TableCell>
                        <TableCell className="text-right text-white/70">
                          {new Date(participant.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Vencedores */}
        <Card className="mt-8 bg-gradient-to-r from-pink-500/10 to-purple-600/10 border-pink-500/30">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Award className="h-6 w-6 text-pink-400" />
              Vencedores Anteriores
            </CardTitle>
            <CardDescription className="text-white/70">
              Lista dos sorteados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingWinners ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-white/50" />
                <p className="mt-2 text-white/70">Carregando vencedores...</p>
              </div>
            ) : winners.length === 0 ? (
              <p className="text-center py-8 text-white/70">Nenhum vencedor ainda</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {winners.map((winner) => (
                  <div 
                    key={winner.id} 
                    className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                        <User className="h-5 w-5 text-pink-400" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{winner.name}</h4>
                        <p className="text-sm text-pink-400">{winner.perfil_ig}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10 text-sm text-white/70">
                      <p>Telefone: {winner.phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3')}</p>
                      <p>Data: {new Date(winner.updated_at).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}