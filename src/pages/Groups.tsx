import { useEffect, useState, useRef } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Plus, MessageSquare, UserPlus, MoreVertical, Send,
  Search, ArrowLeft, Trash2, Edit2, UserX, UserCheck,
  Users, User, ShieldAlert, Heart, Loader2
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Groups = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // High-level state
  const [chatType, setChatType] = useState<'groups' | 'direct'>('direct');
  const [loading, setLoading] = useState(true);

  // Groups State
  const [groups, setGroups] = useState<any[]>([]);

  // Direct Messages State
  const [contacts, setContacts] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null); // Can be group or profile
  const [messages, setMessages] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [unreadMap, setUnreadMap] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // Search Queries
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [peerSearch, setPeerSearch] = useState('');

  const fetchBasics = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // 1. Fetch Groups
      const { data: groupData } = await (supabase.from('groups' as any)
        .select('*, group_members!inner(*)')
        .order('last_message_at', { ascending: false }) as any);
      setGroups(groupData || []);

      // 2. Fetch Contacts (Direct Messages)
      // Note: Using explicit hints for foreign keys to avoid 406 Not Acceptable
      const { data: contactData, error: contactError } = await (supabase.from('chat_contacts' as any)
        .select(`
          *,
          contact:profiles!chat_contacts_contact_id_fkey(user_id, full_name, avatar_url, email),
          owner:profiles!chat_contacts_user_id_fkey(user_id, full_name, avatar_url, email)
        `)
        .or(`user_id.eq.${user?.id},contact_id.eq.${user?.id}`)
        .order('last_message_at', { ascending: false }) as any);

      if (contactError) throw contactError;

      const formattedContacts = contactData?.map((c: any) => {
        const other = c.user_id === user?.id ? c.contact : c.owner;
        return { ...c, profile: other };
      }).filter((c: any) => c.profile) || []; // Filter out any with missing profiles
      setContacts(formattedContacts);

      // 3. Fetch All Users for Search
      const { data: userData } = await supabase.from('profiles').select('user_id, full_name, email, avatar_url');
      setAllUsers(userData || []);

      // 4. Initialize Unread Indications (Persistent Database Check)
      const newUnread: Record<string, boolean> = {};

      // Check Groups
      groupData?.forEach((g: any) => {
        const myMember = g.group_members?.find((m: any) => m.user_id === user?.id);
        if (g.last_message_at && myMember?.last_read_at &&
          new Date(g.last_message_at) > new Date(myMember.last_read_at) &&
          g.sender_id !== user?.id) {
          newUnread[g.id] = true;
        }
      });

      // Check Direct Chats
      formattedContacts?.forEach((c: any) => {
        const myReadAt = c.user_id === user?.id ? c.user_last_read_at : c.contact_last_read_at;
        if (c.last_message_at && myReadAt &&
          new Date(c.last_message_at) > new Date(myReadAt) &&
          c.sender_id !== user?.id) {
          newUnread[c.id] = true;
        }
      });
      setUnreadMap(newUnread);

    } catch (error: any) {
      console.error('Fetch Basics Error:', error);
      toast({ title: 'Fetch failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chat: any) => {
    if (!user || !chat) return;
    try {
      let query = supabase.from('direct_messages' as any).select('*, profiles!direct_messages_sender_id_fkey(full_name, avatar_url)');

      if (chat.user_id) { // Direct Chat
        query = query.or(`and(sender_id.eq.${user?.id},receiver_id.eq.${chat.user_id}),and(sender_id.eq.${chat.user_id},receiver_id.eq.${user?.id})`);
      } else { // Group Chat
        query = query.eq('group_id', chat.id);
      }

      const { data, error } = await query.order('created_at', { ascending: true });
      if (error) throw error;
      setMessages(data || []);

      if (!chat.user_id) {
        // Fetch group members if it's a group
        const { data: mb } = await (supabase.from('group_members' as any)
          .select('*, profiles(full_name, email, avatar_url)')
          .eq('group_id', chat.id) as any);
        setMembers(mb || []);
      }
    } catch (error: any) {
      console.error('Msg fetch error:', error);
    }
  };

  useEffect(() => {
    if (user) fetchBasics();

    const contactSub = supabase.channel('social_updates')
      .on('postgres_changes', { event: '*', table: 'chat_contacts', schema: 'public' }, () => fetchBasics())
      .on('postgres_changes', { event: '*', table: 'groups', schema: 'public' }, () => fetchBasics())
      .subscribe();

    return () => { supabase.removeChannel(contactSub); };
  }, [user]);

  useEffect(() => {
    if (!selectedChat) return;
    fetchMessages(selectedChat);

    // 1. Mark as Read Locally
    setUnreadMap(prev => {
      const next = { ...prev };
      delete next[selectedChat.id || selectedChat.user_id];
      return next;
    });

    // 2. Mark as Read in Database (Persistent)
    const markRead = async () => {
      const isGroup = !!selectedChat.id;
      let dbId = selectedChat.id;
      if (!isGroup) {
        // Find the chat_contact record ID
        const relationship = contacts.find(c => c.profile?.user_id === selectedChat.user_id);
        dbId = relationship?.id;
      }
      if (dbId) {
        await (supabase.rpc('mark_chat_as_read', { chat_id: dbId, is_group: isGroup }) as any);
      }
    };
    markRead();

    // Dynamic channel name based on context
    // For direct chats, we sort the IDs so both parties end up in the same channel room
    const sortedDirectIds = selectedChat.user_id ? [user?.id, selectedChat.user_id].sort().join('_') : '';
    const channelId = selectedChat.id ? `group_${selectedChat.id}` : `direct_${sortedDirectIds}`;
    const msgSub = supabase.channel(`msgs_${channelId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        table: 'direct_messages',
        schema: 'public'
      }, (payload) => {
        const newMsg = payload.new as any;
        console.log('[SocialHub] New Message Received:', newMsg);

        const isRelevant = (selectedChat.id && newMsg.group_id === selectedChat.id) ||
          (!selectedChat.id && (
            (newMsg.sender_id === selectedChat.user_id && newMsg.receiver_id === user?.id) ||
            (newMsg.sender_id === user?.id && newMsg.receiver_id === selectedChat.user_id)
          ));

        if (isRelevant) {
          // Refetch messages for current chat
          fetchMessages(selectedChat);
          // Force scroll
          setTimeout(() => {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        } else {
          // If not in current chat, show a notification toast
          // and refresh sidebar to show new sorting/indicator
          fetchBasics();

          if (newMsg.sender_id !== user?.id) {
            setUnreadMap(prev => ({ ...prev, [newMsg.group_id || newMsg.sender_id]: true }));
            toast({
              title: "New Message",
              description: "You have a new message in a different thread.",
              className: "bg-primary text-white font-bold rounded-2xl shadow-premium"
            });
          }
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(msgSub); };
  }, [selectedChat, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !user) return;

    // Check relationship status for direct chats
    if (!selectedChat.id) {
      const rel = contacts.find(c => c.profile?.user_id === selectedChat.user_id);
      if (rel?.status === 'blocked') {
        toast({ title: 'User Blocked', description: 'Unblock to send messages.', variant: 'destructive' });
        return;
      }
      if (rel?.status !== 'accepted') {
        toast({ title: 'Chat Not Accepted', description: 'Conversation must be accepted by both parties before chatting.', variant: 'destructive' });
        return;
      }
    }

    try {
      const payload: any = {
        sender_id: user?.id,
        content: newMessage.trim()
      };

      if (selectedChat.id) payload.group_id = selectedChat.id;
      else payload.receiver_id = selectedChat.user_id;

      const { error } = await supabase.from('direct_messages' as any).insert([payload]);
      if (error) throw error;
      setNewMessage('');
      fetchMessages(selectedChat);
    } catch (error: any) {
      toast({ title: 'Send failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleSocialAction = async (targetId: string, action: 'accept' | 'block' | 'remove' | 'request') => {
    if (!user) return;
    try {
      if (action === 'remove') {
        await (supabase.from('chat_contacts' as any).delete().or(`and(user_id.eq.${user?.id},contact_id.eq.${targetId}),and(user_id.eq.${targetId},contact_id.eq.${user?.id})`) as any);
      } else {
        let status: 'pending' | 'accepted' | 'blocked';
        if (action === 'request') status = 'pending';
        else if (action === 'accept') status = 'accepted';
        else status = 'blocked';

        // Find existing record to update correctly
        const { data: existing } = await (supabase.from('chat_contacts' as any)
          .select('*')
          .or(`and(user_id.eq.${user?.id},contact_id.eq.${targetId}),and(user_id.eq.${targetId},contact_id.eq.${user?.id})`)
          .maybeSingle() as any);

        if (existing) {
          await supabase.from('chat_contacts' as any).update({
            status,
            updated_at: new Date().toISOString()
          }).eq('id', existing.id);
        } else {
          await supabase.from('chat_contacts' as any).insert({
            user_id: user?.id,
            contact_id: targetId,
            status: status
          });
        }
      }
      toast({ title: 'Success', description: `User relationship updated.` });
      fetchBasics();
    } catch (error: any) {
      toast({ title: 'Action failed', description: error.message, variant: 'destructive' });
    }
  };

  const handleStartChat = async (profile: any) => {
    if (!user) return;
    try {
      const existing = contacts.find(c => c.profile?.user_id === profile.user_id);
      if (!existing) {
        await supabase.from('chat_contacts' as any).insert({
          user_id: user?.id,
          contact_id: profile.user_id,
          status: 'pending'
        });
        toast({ title: 'Chat Request Sent', description: `A connection request has been sent to ${profile.full_name}.` });
      }
      setSelectedChat(profile);
      setIsSearchOpen(false);
      fetchBasics();
    } catch (error: any) {
      toast({ title: 'Failed to start chat', description: error.message, variant: 'destructive' });
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      const { data, error } = await (supabase.from('groups' as any).insert([{
        name: newGroupName,
        description: newGroupDesc,
        created_by: user?.id
      }]).select() as any);

      if (error) throw error;

      // Auto-join the creator to the group
      if (data && data[0]) {
        await supabase.from('group_members' as any).insert({
          group_id: data[0].id,
          user_id: user?.id,
          role: 'admin'
        });
      }

      setIsCreateOpen(false);
      setNewGroupName('');
      setNewGroupDesc('');
      toast({ title: 'Group Created', description: `Welcome to ${newGroupName}!` });
      setSelectedChat(data[0]);
      fetchBasics();
    } catch (error: any) {
      toast({ title: 'Creation failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-140px)] gap-6 animate-fade-in overflow-hidden">
        {/* Unified Sidebar */}
        <div className={`flex flex-col w-full lg:w-[350px] h-full border rounded-2xl bg-card shadow-premium transition-all ${selectedChat ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-heading text-primary flex items-center gap-2">
                SAMS Social
              </h2>
              <div className="flex gap-2">
                <Button size="icon" variant="ghost" onClick={() => setIsSearchOpen(true)} className="rounded-full hover:bg-primary/10">
                  <UserPlus className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsCreateOpen(true)} className="rounded-full hover:bg-primary/10">
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Tabs defaultValue="direct" onValueChange={(v) => setChatType(v as any)}>
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50 rounded-xl">
                <TabsTrigger value="direct" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Direct</TabsTrigger>
                <TabsTrigger value="groups" className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">Groups</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chats..."
                className="pl-9 h-11 bg-muted/20 border-none rounded-xl"
                value={sidebarSearch}
                onChange={e => setSidebarSearch(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 space-y-2 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Retrieving Threads</p>
                </div>
              ) : chatType === 'direct' ? (
                contacts.filter(c => c.profile?.full_name?.toLowerCase().includes(sidebarSearch.toLowerCase())).length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No chats found.</p>
                  </div>
                ) : (
                  contacts
                    .filter(c => c.profile?.full_name?.toLowerCase().includes(sidebarSearch.toLowerCase()))
                    .map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => chat.profile && setSelectedChat(chat.profile)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${selectedChat?.user_id === chat.profile?.user_id
                          ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
                          : 'hover:bg-muted/50'
                          }`}
                      >
                        <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                          <AvatarImage src={chat.profile?.avatar_url} />
                          <AvatarFallback className={selectedChat?.user_id === chat.profile?.user_id ? 'bg-white/20' : 'gradient-primary text-white'}>
                            {chat.profile?.full_name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left overflow-hidden">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-sm truncate ${unreadMap[chat.id] && selectedChat?.user_id !== chat.profile?.user_id ? 'font-black text-foreground' : 'font-bold'}`}>
                              {chat.profile?.full_name}
                            </span>
                            {chat.status === 'pending' && <Badge variant="secondary" className="text-[8px] h-3 px-1 bg-yellow-500 text-white">REQUEST</Badge>}
                            {unreadMap[chat.id] && selectedChat?.user_id !== chat.profile?.user_id && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                          </div>
                          <p className={`text-xs truncate ${selectedChat?.user_id === chat.profile?.user_id ? 'text-primary-foreground/70' : 'text-muted-foreground'} ${unreadMap[chat.id] && selectedChat?.user_id !== chat.profile?.user_id ? 'font-bold' : ''}`}>
                            {chat.status === 'blocked' ? '[Blocked]' : (chat.last_message_content || 'No messages yet')}
                          </p>
                        </div>
                      </button>
                    ))
                )
              ) : (
                groups.map(group => (
                  <button
                    key={group.id}
                    onClick={() => setSelectedChat(group)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${selectedChat?.id === group.id
                      ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
                      : 'hover:bg-muted/50'
                      }`}
                  >
                    <Avatar className="h-12 w-12 border-2 border-background shadow-sm">
                      <AvatarFallback className={selectedChat?.id === group.id ? 'bg-white/20' : 'gradient-indigo text-white'}>
                        {group.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm truncate block ${unreadMap[group.id] && selectedChat?.id !== group.id ? 'font-black text-foreground' : 'font-bold'}`}>
                          {group.name}
                        </span>
                        {unreadMap[group.id] && selectedChat?.id !== group.id && <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />}
                      </div>
                      <p className={`text-xs truncate ${selectedChat?.id === group.id ? 'text-primary-foreground/70' : 'text-muted-foreground'} ${unreadMap[group.id] && selectedChat?.id !== group.id ? 'font-bold' : ''}`}>
                        {group.last_message_content || `Circle of ${members.length || '--'} members`}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Messaging Area */}
        <div className={`flex-1 flex flex-col h-full border rounded-2xl bg-card overflow-hidden shadow-premium ${!selectedChat ? 'hidden lg:flex items-center justify-center bg-muted/20' : 'flex'}`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-card/80 backdrop-blur sticky top-0 z-20">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSelectedChat(null)}><ArrowLeft className="h-5 w-5" /></Button>
                  <Avatar className="border-2 border-primary/10">
                    <AvatarImage src={selectedChat.avatar_url} />
                    <AvatarFallback className="gradient-primary text-white font-bold">{selectedChat.name?.slice(0, 2).toUpperCase() || selectedChat.full_name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold font-heading text-foreground leading-none mb-1">{selectedChat.name || selectedChat.full_name}</h3>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {selectedChat.id ? `${members.length} members` : (contacts.find(c => (c as any).profile?.user_id === selectedChat.user_id)?.status || 'active').toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {!selectedChat.id && (
                    <>
                      {contacts.find(c => (c as any).profile?.user_id === selectedChat.user_id)?.status === 'pending' && contacts.find(c => (c as any).profile?.user_id === selectedChat.user_id)?.user_id !== user?.id && (
                        <Button size="sm" variant="default" className="h-8 gap-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleSocialAction(selectedChat.user_id, 'accept')}>
                          <UserCheck className="h-4 w-4" /> Accept
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleSocialAction(selectedChat.user_id, 'block')} className="text-destructive">
                            <ShieldAlert className="h-4 w-4 mr-2" /> Block User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSocialAction(selectedChat.user_id, 'remove')} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" /> Remove Chat
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                  {selectedChat.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit2 className="h-4 w-4 mr-2" /> Settings</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="h-4 w-4 mr-2" /> Leave Circle</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {!selectedChat.id && contacts.find(c => (c as any).profile?.user_id === selectedChat.user_id)?.status === 'blocked' && (
                <div className="bg-destructive/10 p-4 text-center text-destructive flex items-center justify-center gap-2 border-b">
                  <ShieldAlert className="h-4 w-4" /> You have blocked this user. Unblock to chat.
                </div>
              )}

              <ScrollArea className="flex-1 p-6 bg-muted/5 relative">
                <div className="space-y-6">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20 filter grayscale">
                      <Heart className="h-16 w-16 mb-4 animate-pulse text-primary" />
                      <p className="font-bold">Start a beautiful conversation</p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isOwn = msg.sender_id === user?.id;
                      const showProfile = !isOwn && (!messages[i - 1] || messages[i - 1].sender_id !== msg.sender_id);

                      return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                            <Avatar className={`h-6 w-6 border ${showProfile ? 'opacity-100' : 'opacity-0'}`}>
                              <AvatarFallback className="text-[10px] bg-muted">{msg.profiles?.full_name?.slice(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              {showProfile && <span className="text-[8px] font-bold uppercase text-muted-foreground ml-2 mb-1">{msg.profiles?.full_name}</span>}
                              <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-premium ${isOwn
                                ? 'bg-primary text-primary-foreground rounded-tr-none'
                                : 'bg-card text-foreground rounded-tl-none border'
                                }`}>
                                {msg.content}
                                <div className={`text-[8px] mt-1 text-right opacity-60`}>
                                  {msg.created_at ? format(new Date(msg.created_at), 'HH:mm') : '...'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>

              <div className="p-4 bg-card border-t group">
                {(!selectedChat.id && contacts.find(c => (c as any).profile?.user_id === selectedChat.user_id)?.status !== 'accepted') ? (
                  <div className="flex flex-col items-center gap-3 p-2 bg-muted/20 rounded-2xl border border-dashed">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      <ShieldAlert className="h-3 w-3" />
                      {!contacts.find(c => (c as any).profile?.user_id === selectedChat.user_id)
                        ? "Start a new connection"
                        : contacts.find(c => (c as any).profile?.user_id === selectedChat.user_id)?.status === 'blocked'
                          ? "User Blocked"
                          : contacts.find(c => (c as any).profile?.user_id === selectedChat.user_id)?.user_id === user?.id
                            ? "Waiting for acceptance..."
                            : "Accept request to start chatting"}
                    </div>
                    {!contacts.find(c => (c as any).profile?.user_id === selectedChat.user_id) ? (
                      <Button className="w-full gradient-primary h-11 rounded-xl font-bold" onClick={() => handleSocialAction(selectedChat.user_id, 'request')}>
                        Send Connection Request
                      </Button>
                    ) : (contacts.find(c => (c as any).profile?.user_id === selectedChat.user_id)?.status === 'pending' && contacts.find(c => (c as any).profile?.user_id === selectedChat.user_id)?.user_id !== user?.id) && (
                      <Button className="w-full gradient-primary h-11 rounded-xl font-bold" onClick={() => handleSocialAction(selectedChat.user_id, 'accept')}>
                        Accept and Chat
                      </Button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                    <Input
                      placeholder="Type something amazing..."
                      className="flex-1 h-12 bg-muted/30 border-none rounded-2xl px-6 focus-visible:ring-primary shadow-inner text-sm"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" size="icon" className="h-12 w-12 rounded-2xl gradient-primary shadow-premium group-hover:scale-105 transition-transform">
                      <Send className="h-5 w-5" />
                    </Button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <MessageSquare className="h-24 w-24 text-primary relative" />
              </div>
              <div className="max-w-xs space-y-2">
                <h3 className="text-2xl font-bold font-heading text-foreground">Social Hub</h3>
                <p className="text-muted-foreground text-sm">Connect with peers, join study circles, and collaborate in real-time.</p>
              </div>
              <Button className="gradient-primary rounded-2xl px-10 py-6 font-bold shadow-premium" onClick={() => setIsSearchOpen(true)}>
                Find a Peer
              </Button>
            </div>
          )}
        </div>

        {selectedChat && chatType === 'groups' && (
          <div className="hidden xl:flex flex-col w-72 h-full border rounded-2xl bg-card shadow-premium overflow-hidden">
            <div className="p-8 text-center border-b">
              <Avatar className="h-24 w-24 mx-auto mb-4 border-4 border-primary/10 shadow-lg">
                <AvatarFallback className="gradient-indigo text-white text-3xl font-bold">{selectedChat.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h3 className="font-bold font-heading text-lg">{selectedChat.name}</h3>
              <p className="text-xs text-muted-foreground mt-2 px-4 italic">"{selectedChat.description || 'No bio provided'}"</p>
            </div>
            <div className="p-4 flex-1 h-full overflow-hidden flex flex-col">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                <Users className="h-3 w-3" /> Members • {members.length}
              </h4>
              <ScrollArea className="flex-1">
                <div className="space-y-4">
                  {members.map(m => (
                    <div key={m.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarImage src={m.profiles?.avatar_url} /><AvatarFallback>{m.profiles?.full_name?.slice(0, 1)}</AvatarFallback></Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold truncate">{m.profiles?.full_name}</p>
                        <p className="text-[9px] text-muted-foreground uppercase">{m.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="rounded-3xl border-none shadow-premium">
          <DialogHeader>
            <DialogTitle className="text-2xl font-heading">New Study Circle</DialogTitle>
            <DialogDescription>Create a space for deep collaboration.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateGroup} className="space-y-6 pt-4">
            <div className="space-y-2">
              <Label>Circle Name</Label>
              <Input placeholder="e.g. quantum_physics_devs" value={newGroupName} onChange={e => setNewGroupName(e.target.value)} required className="h-12 bg-muted/30 border-none rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Vision / Description</Label>
              <Input placeholder="What are we solving?" value={newGroupDesc} onChange={e => setNewGroupDesc(e.target.value)} className="h-12 bg-muted/30 border-none rounded-xl" />
            </div>
            <Button type="submit" className="w-full h-12 gradient-primary font-bold rounded-xl shadow-premium">Launch Hub</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="rounded-3xl border-none shadow-premium sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Find a Peer</DialogTitle>
            <DialogDescription>Search for classmates by name or email to start a direct connection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or email..."
                className="pl-9 h-12 bg-muted/30 border-none rounded-xl"
                value={peerSearch}
                onChange={e => setPeerSearch(e.target.value)}
              />
            </div>
            <ScrollArea className="h-64 rounded-xl border p-2">
              <div className="space-y-2">
                {allUsers
                  .filter(u => u.user_id !== user?.id)
                  .filter(u =>
                    u.full_name?.toLowerCase().includes(peerSearch.toLowerCase()) ||
                    u.email?.toLowerCase().includes(peerSearch.toLowerCase())
                  )
                  .map(u => (
                    <div key={u.user_id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-2xl transition-all group">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10"><AvatarImage src={u.avatar_url} /><AvatarFallback>{u.full_name?.slice(0, 2)}</AvatarFallback></Avatar>
                        <div><p className="text-sm font-bold">{u.full_name}</p><p className="text-[10px] text-muted-foreground">{u.email}</p></div>
                      </div>
                      <Button size="sm" variant="ghost" className="rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary" onClick={() => handleStartChat(u)}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Groups;
