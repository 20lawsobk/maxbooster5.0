import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DollarSign,
  Users,
  Plus,
  Edit,
  Trash2,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface Royalty {
  id: string;
  platform: string;
  amount: number;
  currency: string;
  period: string;
  streams: number;
  payoutStatus: string;
  payoutDate?: string;
}

interface RoyaltyManagerProps {
  royalties: Royalty[];
}

export default function RoyaltyManager({ royalties }: RoyaltyManagerProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState({
    name: '',
    email: '',
    role: '',
    percentage: 0,
  });

  const [collaborators, setCollaborators] = useState([
    {
      id: '1',
      name: 'Alex Chen',
      email: 'alex@example.com',
      role: 'Producer',
      percentage: 65,
      avatar: '🎵',
    },
    {
      id: '2',
      name: 'Sarah Kim',
      email: 'sarah@example.com',
      role: 'Vocalist',
      percentage: 25,
      avatar: '🎤',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'Songwriter',
      percentage: 10,
      avatar: '✍️',
    },
  ]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-accent/20 text-accent">
            <CheckCircle className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-secondary/20 text-secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'processing':
        return <Badge className="bg-primary/20 text-primary">Processing</Badge>;
      case 'failed':
        return (
          <Badge className="bg-destructive/20 text-destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const addCollaborator = () => {
    if (newCollaborator.name && newCollaborator.email && newCollaborator.percentage > 0) {
      setCollaborators((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          ...newCollaborator,
          avatar: '👤',
        },
      ]);
      setNewCollaborator({ name: '', email: '', role: '', percentage: 0 });
      setShowSplitDialog(false);
    }
  };

  const removeCollaborator = (id: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  const totalPercentage = collaborators.reduce((sum, c) => sum + c.percentage, 0);

  const recentPayouts = [
    { date: 'Dec 1, 2024', amount: 2840, status: 'paid', platform: 'Spotify' },
    { date: 'Nov 1, 2024', amount: 2130, status: 'paid', platform: 'Apple Music' },
    { date: 'Oct 1, 2024', amount: 1920, status: 'paid', platform: 'YouTube Music' },
    { date: 'Sep 15, 2024', amount: 650, status: 'paid', platform: 'Beat Sales' },
  ];

  return (
    <div className="space-y-6">
      {/* Royalty Splits Management */}
      <Card className="glassmorphism">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Royalty Splits</CardTitle>
            <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-add-collaborator">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Collaborator
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Collaborator</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={newCollaborator.name}
                      onChange={(e) =>
                        setNewCollaborator((prev) => ({ ...prev, name: e.target.value }))
                      }
                      data-testid="input-collaborator-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newCollaborator.email}
                      onChange={(e) =>
                        setNewCollaborator((prev) => ({ ...prev, email: e.target.value }))
                      }
                      data-testid="input-collaborator-email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={newCollaborator.role}
                      onValueChange={(value) =>
                        setNewCollaborator((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger data-testid="select-collaborator-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="producer">Producer</SelectItem>
                        <SelectItem value="vocalist">Vocalist</SelectItem>
                        <SelectItem value="songwriter">Songwriter</SelectItem>
                        <SelectItem value="musician">Musician</SelectItem>
                        <SelectItem value="engineer">Engineer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="percentage">Royalty Percentage</Label>
                    <Input
                      id="percentage"
                      type="number"
                      min="0"
                      max="100"
                      value={newCollaborator.percentage}
                      onChange={(e) =>
                        setNewCollaborator((prev) => ({
                          ...prev,
                          percentage: parseInt(e.target.value) || 0,
                        }))
                      }
                      data-testid="input-collaborator-percentage"
                    />
                  </div>
                  <Button
                    onClick={addCollaborator}
                    className="w-full"
                    data-testid="button-save-collaborator"
                  >
                    Add Collaborator
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Total Percentage Warning */}
          {totalPercentage !== 100 && (
            <div className="mb-4 p-3 bg-secondary/10 border border-secondary/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-secondary" />
                <span className="text-sm text-secondary">
                  Total percentage: {totalPercentage}% (should equal 100%)
                </span>
              </div>
            </div>
          )}

          {/* Current Collaborators */}
          <div className="space-y-3">
            {collaborators.map((collaborator) => (
              <div
                key={collaborator.id}
                className="flex items-center justify-between p-4 bg-muted/20 rounded-lg"
                data-testid={`collaborator-${collaborator.id}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-lg">{collaborator.avatar}</span>
                  </div>
                  <div>
                    <p className="font-medium">{collaborator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {collaborator.role} • {collaborator.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="font-semibold text-lg">{collaborator.percentage}%</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      data-testid={`button-edit-collaborator-${collaborator.id}`}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeCollaborator(collaborator.id)}
                      data-testid={`button-remove-collaborator-${collaborator.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payouts */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Recent Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentPayouts.map((payout, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/20 rounded"
                data-testid={`payout-${index}`}
              >
                <div>
                  <p className="font-medium">${payout.amount.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {payout.platform} • {payout.date}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(payout.status)}
                  <Button size="sm" variant="ghost" data-testid={`button-download-payout-${index}`}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Royalty Statements */}
      <Card className="glassmorphism">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Royalty Statements</CardTitle>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48" data-testid="select-royalty-period">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                <SelectItem value="last">Last Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3">Period</th>
                  <th className="text-left p-3">Platform</th>
                  <th className="text-right p-3">Streams</th>
                  <th className="text-right p-3">Earnings</th>
                  <th className="text-right p-3">Status</th>
                  <th className="text-right p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {royalties.slice(0, 5).map((royalty, index) => (
                  <tr key={royalty.id} className="border-b border-border/50">
                    <td className="p-3">{royalty.period}</td>
                    <td className="p-3 capitalize">{royalty.platform}</td>
                    <td className="text-right p-3">{royalty.streams.toLocaleString()}</td>
                    <td className="text-right p-3 font-medium">${royalty.amount.toFixed(2)}</td>
                    <td className="text-right p-3">{getStatusBadge(royalty.payoutStatus)}</td>
                    <td className="text-right p-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        data-testid={`button-download-statement-${index}`}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card className="glassmorphism">
        <CardHeader>
          <CardTitle>Payment Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Bank Transfer</p>
                  <p className="text-sm text-muted-foreground">••••••1234 • Primary</p>
                </div>
              </div>
              <Badge className="bg-accent/20 text-accent">Active</Badge>
            </div>

            <Button variant="outline" className="w-full" data-testid="button-add-payment-method">
              Add Payment Method
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
