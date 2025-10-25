"use client";

import { useEffect } from "react";
import { Separator } from "@radix-ui/react-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  UserPlus,
  Crown,
  TrendingUp,
  ArrowDownLeft,
  ArrowDownRight,
  Sparkles,
  Award,
  Network,
} from "lucide-react";

import { useTeam } from "@/store/team";

interface TreeNodeProps {
  name: string;
  userid: number | string;
  s_pv: number;
  l_pv: number;
  r_pv: number;
  isRoot?: boolean;
  refCode?: string;
}

const TreeNode = ({
  name,
  userid,
  s_pv,
  l_pv,
  r_pv,
  isRoot,
  refCode,
}: TreeNodeProps) => (
  <div className="flex flex-col items-center group">
    <div
      className={`relative ${
        isRoot
          ? "bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl shadow-purple-500/50"
          : ""
      } border-2 ${
        isRoot ? "border-purple-400/50" : "border-[#444] hover:border-[#555]"
      } rounded-xl p-5 min-w-[220px] shadow-lg hover:shadow-2xl transition-all duration-300 transform `}
      style={
        !isRoot
          ? {
              background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
            }
          : undefined
      }
    >
      {isRoot && (
        <div className="absolute -top-3 -right-3">
          <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
      )}
      <div
        className={`p-1.5 rounded-full w-fit mx-auto ${
          isRoot ? "bg-white/20" : "bg-blue-600/20"
        }`}
      >
        <Users
          className={`w-10 h-10 mx-1 my-1 ${
            isRoot ? "" : "text-blue-400"
          }`}
        />
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p
            className={`${
              isRoot ? " font-bold" : " font-semibold"
            } text-sm truncate max-w-[100px]`}
          >
            {name}
          </p>
        </div>
        <Badge
          variant="secondary"
          className={`${
            isRoot
              ? "bg-yellow-500/90 hover:bg-yellow-500"
              : "bg-blue-600/90 hover:bg-blue-600"
          }  text-xs px-2 py-0.5`}
        >
          #{userid}
        </Badge>
      </div>

      {refCode && (
        <div className="flex items-center gap-2 mb-3 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10">
          <Sparkles className="w-3 h-3 text-yellow-400" />
          <p className="text-xs text-gray-200 font-mono font-medium">
            {refCode}
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-white/10">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Award className="w-3 h-3 text-gray-400" />
          </div>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">
            Self
          </p>
          <p className=" font-bold text-sm">
            {new Intl.NumberFormat().format(s_pv)}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <ArrowDownLeft className="w-3 h-3 text-blue-400" />
          </div>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">
            Left
          </p>
          <p className="text-blue-400 font-bold text-sm">
            {new Intl.NumberFormat().format(l_pv)}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <ArrowDownRight className="w-3 h-3 text-green-400" />
          </div>
          <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-1">
            Right
          </p>
          <p className="text-green-400 font-bold text-sm">
            {new Intl.NumberFormat().format(r_pv)}
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default function TeamPage() {
  const { teamData, loading, error, fetchTeamData } = useTeam();

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  if (loading) {
    return (
      <>
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Network className="w-6 h-6 md:w-8 md:h-8 " />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              My Team
            </h1>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-[#989898] to-transparent h-px mb-6 md:mb-8" />

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border-[#333]"
                style={{
                  background:
                    "linear-gradient(180deg, #343967 0%, #263450 100%)",
                }}
              >
                <CardHeader>
                  <Skeleton className="h-6 w-32 bg-[#2a2a2a]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 bg-[#2a2a2a]" />
                  <Skeleton className="h-4 w-3/4 bg-[#2a2a2a]" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Network className="w-6 h-6 md:w-8 md:h-8 " />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              My Team
            </h1>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-[#989898] to-transparent h-px mb-6 md:mb-8" />

        <Card
          className="border-red-500/30"
          style={{
            background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
          }}
        >
          <CardContent className="pt-6">
            <div className="text-center text-red-400">
              <p>Error loading team data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!teamData) {
    return (
      <>
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-3 md:gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg">
              <Network className="w-6 h-6 md:w-8 md:h-8 " />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              My Team
            </h1>
          </div>
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-[#989898] to-transparent h-px mb-6 md:mb-8" />

        <Card
          className="border-[#333]"
          style={{
            background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
          }}
        >
          <CardContent className="pt-6">
            <div className="text-center text-gray-400">
              <p>No team data available</p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/20">
            <Network className="w-6 h-6 md:w-8 md:h-8 " />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            My Team
          </h1>
        </div>
      </div>

      <Separator className="bg-gradient-to-r from-transparent via-[#989898] to-transparent h-px mb-6 md:mb-8" />

      {/* Summary Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card
          className="border-[#333] hover:border-purple-500/50 transition-all duration-300 group"
          style={{
            background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="w-4 h-4 text-purple-400" />
                  <p className="text-gray-400 text-xs uppercase tracking-wider">
                    Total Referrals
                  </p>
                </div>
                <p className=" text-3xl font-bold group-hover:text-purple-400 transition-colors">
                  {teamData.total_referrals}
                </p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl group-hover:bg-yellow-600/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-[#333] hover:border-blue-500/50 transition-all duration-300 group"
          style={{
            background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownLeft className="w-4 h-4 text-blue-400" />
                  <p className="text-gray-400 text-xs uppercase tracking-wider">
                    Left Team
                  </p>
                </div>
                <p className=" text-3xl font-bold group-hover:text-blue-400 transition-colors">
                  {teamData.children.left.length}
                </p>
              </div>
              <div className="p-3 bg-blue-600/10 rounded-xl group-hover:bg-blue-600/20 transition-colors">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-[#333] hover:border-green-500/50 transition-all duration-300 group"
          style={{
            background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
          }}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownRight className="w-4 h-4 text-green-400" />
                  <p className="text-gray-400 text-xs uppercase tracking-wider">
                    Right Team
                  </p>
                </div>
                <p className=" text-3xl font-bold group-hover:text-green-400 transition-colors">
                  {teamData.children.right.length}
                </p>
              </div>
              <div className="p-3 bg-green-600/10 rounded-xl group-hover:bg-green-600/20 transition-colors">
                <Users className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sponsor & Upline Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card
          className="border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
          style={{
            background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-400" />
              <CardTitle className=" text-base">Sponsor</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className=" font-semibold text-lg">
                {teamData.sponsor.name}
              </p>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-purple-600 to-purple-700  text-xs px-3 py-1"
              >
                #{teamData.sponsor.userid}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card
          className="border-purple-500/30 hover:border-purple-500/50 transition-all duration-300"
          style={{
            background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
          }}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <CardTitle className=" text-base">Upline</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className=" font-semibold text-lg">
                {teamData.upline.name}
              </p>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-purple-600 to-purple-700  text-xs px-3 py-1"
              >
                #{teamData.upline.userid}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Binary Tree Visualization */}
      <Card
        className=" transition-all duration-300 overflow-x-auto border-gray-500"
        style={{
          background: "linear-gradient(180deg, #343967 0%, #263450 100%)",
        }}
      >
        <CardHeader className="border-b border-[#333]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
              <Network className="w-5 h-5 " />
            </div>
            <CardTitle className=" text-xl">
              Binary Team Structure
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-12 min-w-[800px]">
            {/* Root Node (Current User) */}
            <div className="relative">
              <TreeNode
                name={teamData.user.firstname}
                userid={teamData.user.userid}
                s_pv={teamData.user.s_pv}
                l_pv={teamData.user.l_pv}
                r_pv={teamData.user.r_pv}
                isRoot={true}
                refCode={teamData.user.ref_code}
              />
            </div>

            {/* Connecting Lines with Glow Effect */}
            <div className="relative w-full flex justify-center -my-4">
              <div className="absolute top-0 left-1/2 w-0.5 h-10 bg-gradient-to-b from-purple-500 to-blue-500 shadow-lg shadow-purple-500/50"></div>
              <div className="absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 shadow-lg shadow-purple-500/50"></div>
              <div className="absolute top-10 left-1/4 w-0.5 h-10 bg-gradient-to-b from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50"></div>
              <div className="absolute top-10 right-1/4 w-0.5 h-10 bg-gradient-to-b from-green-500 to-green-600 shadow-lg shadow-green-500/50"></div>
            </div>

            {/* Children Level */}
            <div className="w-full grid grid-cols-2 gap-12 pt-20">
              {/* Left Team */}
              <div className="flex flex-col items-center space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  {/* <div className="p-2 bg-blue-600/20 rounded-lg">
                    <ArrowDownLeft className="w-5 h-5 text-blue-400" />
                  </div> */}
                  {/* <Badge
                    variant="outline"
                    className="border-blue-500/50 bg-blue-500/10 text-blue-400 px-4 py-1.5 text-sm font-semibold"
                  >
                    Left Team ({teamData.children.left.length})
                  </Badge> */}
                </div>
                {teamData.children.left.length > 0 ? (
                  <div className="space-y-5 w-full max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {teamData.children.left.map((member) => (
                      <TreeNode
                        key={member.userid}
                        name={member.firstname}
                        userid={member.userid}
                        s_pv={member.s_pv}
                        l_pv={member.l_pv}
                        r_pv={member.r_pv}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="text-center text-gray-400 py-12 rounded-xl w-full border-2 border-dashed border-blue-600/30 hover:border-blue-600/50 transition-colors"
                    style={{
                      background:
                        "linear-gradient(180deg, #343967 0%, #263450 100%)",
                    }}
                  >
                    <Users className="w-12 h-12 mx-auto mb-3 text-blue-600/30" />
                    <p className="text-sm font-medium">No left team members</p>
                  </div>
                )}
              </div>

              {/* Right Team */}
              <div className="flex flex-col items-center space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  {/* <div className="p-2 bg-green-600/20 rounded-lg">
                    <ArrowDownRight className="w-5 h-5 text-green-400" />
                  </div> */}
                  {/* <Badge
                    variant="outline"
                    className="border-green-500/50 bg-green-500/10 text-green-400 px-4 py-1.5 text-sm font-semibold"
                  >
                    Right Team ({teamData.children.right.length})
                  </Badge> */}
                </div>
                {teamData.children.right.length > 0 ? (
                  <div className="space-y-5 w-full max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {teamData.children.right.map((member) => (
                      <TreeNode
                        key={member.userid}
                        name={member.firstname}
                        userid={member.userid}
                        s_pv={member.s_pv}
                        l_pv={member.l_pv}
                        r_pv={member.r_pv}
                      />
                    ))}
                  </div>
                ) : (
                  <div
                    className="text-center text-gray-400 py-12 rounded-xl w-full border-2 border-dashed border-green-600/30 hover:border-green-600/50 transition-colors"
                    style={{
                      background:
                        "linear-gradient(180deg, #343967 0%, #263450 100%)",
                    }}
                  >
                    <Users className="w-12 h-12 mx-auto mb-3 text-green-600/30" />
                    <p className="text-sm font-medium">No right team members</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #6366f1, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #818cf8, #a78bfa);
        }
      `}</style>
    </>
  );
}
