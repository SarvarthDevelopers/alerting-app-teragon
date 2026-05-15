import { useState } from 'react';
import { UserPlus, Shield, Trash2, Search, Pencil, Calendar, User as UserIcon, Mail } from 'lucide-react';
import { User, UserRole } from '../../../app/types';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../../../app/components/ui/button';
import { Input } from '../../../app/components/ui/input';
import { Switch } from '../../../app/components/ui/switch';
import { Badge } from '../../../app/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../app/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../app/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../app/components/ui/select';
import { Label } from '../../../app/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../app/components/ui/alert-dialog";

interface DesktopUserManagementProps {
  users: User[];
  setUsers: (users: User[]) => void;
}

export function DesktopUserManagement({ users, setUsers }: DesktopUserManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    fullName: '',
    email: '',
    role: 'OPERATOR',
    isActive: true,
    forcePasswordChange: true,
    password: ''
  });
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const saveUser = () => {
    if (newUser.fullName && newUser.username) {
      if (editingUserId) {
        setUsers(users.map(u => u.id === editingUserId ? {
          ...u,
          ...newUser,
          role: newUser.role as UserRole
        } : u));
      } else {
        setUsers([
          ...users,
          {
            id: `u${Date.now()}`,
            fullName: newUser.fullName!,
            username: newUser.username!,
            email: newUser.email,
            role: newUser.role as UserRole,
            isActive: newUser.isActive!,
            forcePasswordChange: newUser.forcePasswordChange!,
            password: newUser.password,
            createdAt: new Date().toISOString()
          }
        ]);
      }
      resetForm();
      setIsAddDialogOpen(false);
    }
  };

  const resetForm = () => {
    setNewUser({
      fullName: '',
      username: '',
      email: '',
      role: 'OPERATOR',
      isActive: true,
      forcePasswordChange: true,
      password: ''
    });
    setEditingUserId(null);
  };

  const openEditDialog = (user: User) => {
    setNewUser({
      fullName: user.fullName,
      username: user.username,
      email: user.email || '',
      role: user.role,
      isActive: user.isActive,
      forcePasswordChange: user.forcePasswordChange,
      password: user.password || ''
    });
    setEditingUserId(user.id);
    setIsAddDialogOpen(true);
  };

  const toggleUserActive = (id: string) => {
    setUsers(users.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    setUserToDelete(null);
  };

  const getRoleVariant = (role: UserRole) => {
    switch (role) {
      case 'ADMIN': return 'destructive';
      case 'LEAD': return 'default';
      default: return 'secondary';
    }
  };

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="pb-20">
      {/* Title Section - Standard Layout */}
      <div className="px-4 py-6 border-b border-border bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage system access and operator permissions
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64 h-10 bg-background/50 border-border/50 rounded-xl font-bold text-sm focus-visible:ring-4 focus-visible:ring-black/5 focus-visible:border-black transition-all"
              />
            </div>
            <Button
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
              className="rounded-xl h-10 px-4 font-bold"
            >
              <UserPlus size={16} className="mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Compact Table Container */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6 h-12 text-xs font-bold text-foreground uppercase tracking-wider">User</TableHead>
                <TableHead className="px-6 h-12 text-xs font-bold text-foreground uppercase tracking-wider">Role</TableHead>
                <TableHead className="px-6 h-12 text-xs font-bold text-foreground uppercase tracking-wider">Status</TableHead>
                <TableHead className="px-6 h-12 text-xs font-bold text-foreground uppercase tracking-wider">Joined</TableHead>
                <TableHead className="px-6 h-12 text-xs font-bold text-foreground uppercase tracking-wider text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence initial={false}>
                {filteredUsers.map((user, idx) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="hover:bg-muted/30 transition-colors border-b border-border last:border-none"
                  >
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-sm tracking-tight leading-none">{user.fullName}</div>
                          <div className="mt-1 space-y-0.5">
                            <div className="text-[10px] text-muted-foreground font-mono opacity-70">
                              @{user.username}
                            </div>
                            {user.email && (
                              <div className="text-[10px] text-muted-foreground opacity-60">
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge 
                        variant={getRoleVariant(user.role)}
                        className="rounded-lg px-2 py-0.5 font-bold text-[10px]"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Switch 
                          checked={user.isActive}
                          onCheckedChange={() => toggleUserActive(user.id)}
                        />
                        <span className={`text-[10px] font-bold ${user.isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {user.isActive ? 'Active' : 'Locked'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                        <Calendar size={14} className="opacity-50" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openEditDialog(user)}
                          className="h-8 w-8 text-muted-foreground hover:text-black hover:bg-black/5 rounded-lg"
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setUserToDelete(user)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/50">
              <UserIcon size={48} className="mb-4 opacity-20" />
              <div className="text-sm font-bold">No Users Found</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add User Dialog ── */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">{editingUserId ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUserId ? 'Modify user permissions and account details.' : 'Create a new operator account with specific permissions.'}
            </DialogDescription>
          </DialogHeader>
          
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                <Input 
                  placeholder="John Smith"
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  className="h-12 bg-background/50 border-border/50 rounded-xl px-4 font-bold focus-visible:ring-4 focus-visible:ring-black/5 focus-visible:border-black transition-all"
                />
              </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                  <Input 
                    type="email"
                    placeholder="john.smith@company.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="h-12 bg-background/50 border-border/50 rounded-xl px-4 font-bold focus-visible:ring-4 focus-visible:ring-black/5 focus-visible:border-black transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Username</Label>
                  <Input 
                    placeholder="operator.smith"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value.toLowerCase()})}
                    className="h-12 bg-background/50 border-border/50 rounded-xl px-4 font-mono text-sm focus-visible:ring-4 focus-visible:ring-black/5 focus-visible:border-black transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{editingUserId ? 'Change Password' : 'Initial Password'}</Label>
                  <Input 
                    type="password"
                    placeholder="••••••••"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="h-12 bg-background/50 border-border/50 rounded-xl px-4 font-mono text-sm focus-visible:ring-4 focus-visible:ring-black/5 focus-visible:border-black transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(val: UserRole) => setNewUser({...newUser, role: val})}
                >
                  <SelectTrigger className="h-12 bg-background/50 border-border/50 rounded-xl px-4 font-bold focus-visible:ring-4 focus-visible:ring-black/5 focus-visible:border-black transition-all outline-none">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-card">
                    <SelectItem value="OPERATOR" className="font-bold">Operator</SelectItem>
                    <SelectItem value="LEAD" className="font-bold">Lead</SelectItem>
                    <SelectItem value="ADMIN" className="font-bold">Admin</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-sm font-bold">Force Password Reset</span>
                <span className="text-[10px] text-muted-foreground">Require password change on first login</span>
              </div>
              <Switch 
                checked={newUser.forcePasswordChange}
                onCheckedChange={(val) => setNewUser({...newUser, forcePasswordChange: val})}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button 
              onClick={saveUser}
              disabled={!newUser.fullName || !newUser.username || (!editingUserId && !newUser.password)}
              className="flex-1 h-12 rounded-xl font-bold"
            >
              {editingUserId ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ── */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="sm:max-w-[420px] rounded-[32px] border-border bg-card p-8">
          <AlertDialogHeader className="mb-6">
            <div className="w-16 h-16 rounded-[24px] bg-destructive/10 flex items-center justify-center mb-4 mx-auto sm:mx-0 border border-destructive/20">
              <Trash2 size={32} className="text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl font-black tracking-tight">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground font-bold mt-2 leading-relaxed">
              Are you sure you want to delete <span className="text-foreground underline decoration-destructive decoration-2 underline-offset-4">{userToDelete?.fullName}</span>? This action cannot be undone and will immediately revoke all system access for this account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <AlertDialogFooter className="mt-8 gap-3">
            <AlertDialogCancel
              autoFocus
              className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-border/50 hover:bg-muted/50 transition-all focus:border-black focus:ring-black/50 focus:ring-[3px] outline-none"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToDelete && deleteUser(userToDelete.id)}
              className="flex-1 h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-destructive/20 hover:shadow-destructive/30 hover:-translate-y-0.5 transition-all"
            >
              Confirm Deletion
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
